import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StripeService } from '../../server/stripe';

// Mock Stripe
const mockStripe = {
  paymentIntents: {
    create: vi.fn(),
    confirm: vi.fn(),
    retrieve: vi.fn(),
  },
  customers: {
    create: vi.fn(),
    update: vi.fn(),
  },
  subscriptions: {
    create: vi.fn(),
  },
  paymentMethods: {
    list: vi.fn(),
  },
  refunds: {
    create: vi.fn(),
  },
  webhooks: {
    constructEvent: vi.fn(),
  },
};

vi.mock('stripe', () => {
  return {
    default: vi.fn(() => mockStripe),
  };
});

describe('StripeService', () => {
  let stripeService: StripeService;

  beforeEach(() => {
    vi.clearAllMocks();
    stripeService = new StripeService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createPaymentIntent', () => {
    it('creates payment intent with correct amount in Thai Baht', async () => {
      const mockPaymentIntent = {
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret',
        amount: 15000, // 150.00 THB in smallest unit
        currency: 'thb',
      };

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      const result = await stripeService.createPaymentIntent(150, 'thb', {
        orderId: 'order-123',
      });

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 15000, // 150 * 100
        currency: 'thb',
        metadata: { orderId: 'order-123' },
        automatic_payment_methods: { enabled: true },
      });

      expect(result).toEqual(mockPaymentIntent);
    });

    it('defaults to THB currency when not specified', async () => {
      const mockPaymentIntent = { id: 'pi_test_123' };
      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      await stripeService.createPaymentIntent(100);

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          currency: 'thb',
        })
      );
    });
  });

  describe('confirmPayment', () => {
    it('confirms payment intent', async () => {
      const mockConfirmedPayment = {
        id: 'pi_test_123',
        status: 'succeeded',
      };

      mockStripe.paymentIntents.confirm.mockResolvedValue(mockConfirmedPayment);

      const result = await stripeService.confirmPayment('pi_test_123');

      expect(mockStripe.paymentIntents.confirm).toHaveBeenCalledWith('pi_test_123');
      expect(result).toEqual(mockConfirmedPayment);
    });
  });

  describe('createCustomer', () => {
    it('creates Stripe customer with email and name', async () => {
      const mockCustomer = {
        id: 'cus_test_123',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockStripe.customers.create.mockResolvedValue(mockCustomer);

      const result = await stripeService.createCustomer('test@example.com', 'Test User');

      expect(mockStripe.customers.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
      });

      expect(result).toEqual(mockCustomer);
    });

    it('creates customer with email only when name not provided', async () => {
      const mockCustomer = { id: 'cus_test_123' };
      mockStripe.customers.create.mockResolvedValue(mockCustomer);

      await stripeService.createCustomer('test@example.com');

      expect(mockStripe.customers.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: undefined,
      });
    });
  });

  describe('createSubscription', () => {
    it('creates subscription with correct parameters', async () => {
      const mockSubscription = {
        id: 'sub_test_123',
        customer: 'cus_test_123',
        items: [{ price: 'price_test_123' }],
      };

      mockStripe.subscriptions.create.mockResolvedValue(mockSubscription);

      const result = await stripeService.createSubscription('cus_test_123', 'price_test_123');

      expect(mockStripe.subscriptions.create).toHaveBeenCalledWith({
        customer: 'cus_test_123',
        items: [{ price: 'price_test_123' }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      expect(result).toEqual(mockSubscription);
    });
  });

  describe('processRefund', () => {
    it('processes full refund when amount not specified', async () => {
      const mockRefund = {
        id: 'rf_test_123',
        payment_intent: 'pi_test_123',
      };

      mockStripe.refunds.create.mockResolvedValue(mockRefund);

      const result = await stripeService.processRefund('pi_test_123');

      expect(mockStripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_test_123',
      });

      expect(result).toEqual(mockRefund);
    });

    it('processes partial refund with specified amount', async () => {
      const mockRefund = { id: 'rf_test_123' };
      mockStripe.refunds.create.mockResolvedValue(mockRefund);

      await stripeService.processRefund('pi_test_123', 50);

      expect(mockStripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_test_123',
        amount: 5000, // 50 * 100
      });
    });
  });

  describe('getPaymentMethods', () => {
    it('retrieves customer payment methods', async () => {
      const mockPaymentMethods = {
        data: [
          { id: 'pm_test_123', type: 'card' },
          { id: 'pm_test_456', type: 'card' },
        ],
      };

      mockStripe.paymentMethods.list.mockResolvedValue(mockPaymentMethods);

      const result = await stripeService.getPaymentMethods('cus_test_123');

      expect(mockStripe.paymentMethods.list).toHaveBeenCalledWith({
        customer: 'cus_test_123',
        type: 'card',
      });

      expect(result).toEqual(mockPaymentMethods.data);
    });
  });

  describe('handleWebhook', () => {
    it('constructs webhook event with signature verification', async () => {
      const mockEvent = {
        id: 'evt_test_123',
        type: 'payment_intent.succeeded',
      };

      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret';
      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

      const result = await stripeService.handleWebhook(
        'webhook_body',
        'stripe_signature'
      );

      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        'webhook_body',
        'stripe_signature',
        'whsec_test_secret'
      );

      expect(result).toEqual(mockEvent);
    });

    it('throws error when webhook secret is missing', async () => {
      delete process.env.STRIPE_WEBHOOK_SECRET;

      await expect(
        stripeService.handleWebhook('body', 'signature')
      ).rejects.toThrow('Missing Stripe webhook secret');
    });
  });
});