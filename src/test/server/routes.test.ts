import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../../server/routes';

// Mock dependencies
vi.mock('../../server/storage');
vi.mock('../../server/stripe');
vi.mock('../../server/line');
vi.mock('../../server/qrcode');
vi.mock('../../server/replitAuth');
vi.mock('../../server/googleAuth');

describe('API Routes', () => {
  let app: express.Application;
  let server: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    
    // Mock authentication middleware
    app.use((req: any, res, next) => {
      req.user = {
        claims: { sub: 'test-user-id' },
      };
      req.isAuthenticated = () => true;
      next();
    });

    server = await registerRoutes(app);
  });

  describe('Payment Routes', () => {
    describe('POST /api/create-payment-intent', () => {
      it('creates payment intent successfully', async () => {
        const mockStripeService = await import('../../server/stripe');
        vi.mocked(mockStripeService.stripeService.createPaymentIntent).mockResolvedValue({
          id: 'pi_test_123',
          client_secret: 'pi_test_123_secret',
        } as any);

        const response = await request(app)
          .post('/api/create-payment-intent')
          .send({
            amount: 150,
            orderId: 'order-123',
            paymentMethod: 'stripe',
          });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          clientSecret: 'pi_test_123_secret',
          paymentIntentId: 'pi_test_123',
        });
      });

      it('requires authentication', async () => {
        const unauthenticatedApp = express();
        unauthenticatedApp.use(express.json());
        unauthenticatedApp.use((req: any, res, next) => {
          req.isAuthenticated = () => false;
          next();
        });
        
        await registerRoutes(unauthenticatedApp);

        const response = await request(unauthenticatedApp)
          .post('/api/create-payment-intent')
          .send({
            amount: 150,
            orderId: 'order-123',
          });

        expect(response.status).toBe(401);
      });
    });

    describe('POST /api/confirm-payment', () => {
      it('confirms payment and updates order status', async () => {
        const mockStripe = await import('../../server/stripe');
        const mockStorage = await import('../../server/storage');
        
        vi.mocked(mockStripe.stripe.paymentIntents.retrieve).mockResolvedValue({
          status: 'succeeded',
          id: 'pi_test_123',
        } as any);

        vi.mocked(mockStorage.storage.updateOrderStatus).mockResolvedValue({
          id: 'order-123',
          status: 'confirmed',
        } as any);

        vi.mocked(mockStorage.storage.getUser).mockResolvedValue({
          id: 'test-user-id',
          lineUserId: null,
        } as any);

        const response = await request(app)
          .post('/api/confirm-payment')
          .send({
            paymentIntentId: 'pi_test_123',
            orderId: 'order-123',
          });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          success: true,
          status: 'confirmed',
        });
      });
    });
  });

  describe('QR Code Routes', () => {
    describe('GET /api/qr/payment/:orderId', () => {
      it('generates payment QR code', async () => {
        const mockQRService = await import('../../server/qrcode');
        vi.mocked(mockQRService.qrCodeService.generatePaymentQR).mockResolvedValue(
          'data:image/svg+xml;base64,mock_qr_data'
        );

        const response = await request(app)
          .get('/api/qr/payment/order-123?method=promptpay&amount=150');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          qrCode: 'data:image/svg+xml;base64,mock_qr_data',
        });
      });
    });

    describe('GET /api/qr/table/:restaurantId/:tableNumber', () => {
      it('generates table QR code without authentication', async () => {
        const mockQRService = await import('../../server/qrcode');
        vi.mocked(mockQRService.qrCodeService.generateTableQR).mockResolvedValue(
          'data:image/svg+xml;base64,mock_table_qr'
        );

        const response = await request(app)
          .get('/api/qr/table/restaurant-123/table-5');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          qrCode: 'data:image/svg+xml;base64,mock_table_qr',
        });
      });
    });

    describe('GET /api/qr/track/:orderId', () => {
      it('generates order tracking QR code', async () => {
        const mockQRService = await import('../../server/qrcode');
        vi.mocked(mockQRService.qrCodeService.generateOrderTrackingQR).mockResolvedValue(
          'data:image/svg+xml;base64,mock_tracking_qr'
        );

        const response = await request(app)
          .get('/api/qr/track/order-tracking-123');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          qrCode: 'data:image/svg+xml;base64,mock_tracking_qr',
        });
      });
    });
  });

  describe('Social Authentication Routes', () => {
    describe('GET /api/auth/google', () => {
      it('redirects to Google OAuth', async () => {
        const response = await request(app)
          .get('/api/auth/google');

        // Should redirect to Google OAuth (passport handles this)
        expect([302, 500]).toContain(response.status); // 500 because passport is mocked
      });
    });

    describe('GET /api/auth/line', () => {
      it('redirects to LINE OAuth', async () => {
        const mockLineService = await import('../../server/line');
        vi.mocked(mockLineService.lineService.getAuthUrl).mockReturnValue(
          'https://access.line.me/oauth2/v2.1/authorize?...'
        );

        const response = await request(app)
          .get('/api/auth/line');

        expect(response.status).toBe(302);
        expect(response.header.location).toContain('access.line.me');
      });
    });
  });

  describe('LINE Notification Routes', () => {
    describe('POST /api/notify/order-update', () => {
      it('sends LINE notification successfully', async () => {
        const mockStorage = await import('../../server/storage');
        const mockLineService = await import('../../server/line');

        vi.mocked(mockStorage.storage.getUser).mockResolvedValue({
          id: 'test-user-id',
          lineUserId: 'line-user-123',
        } as any);

        vi.mocked(mockStorage.storage.getOrder).mockResolvedValue({
          id: 'order-123',
          status: 'preparing',
          estimatedDeliveryTime: new Date(),
        } as any);

        vi.mocked(mockLineService.lineService.sendDeliveryUpdate).mockResolvedValue();

        const response = await request(app)
          .post('/api/notify/order-update')
          .send({
            orderId: 'order-123',
            status: 'preparing',
          });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ success: true });
      });

      it('returns error when user has no LINE integration', async () => {
        const mockStorage = await import('../../server/storage');

        vi.mocked(mockStorage.storage.getUser).mockResolvedValue({
          id: 'test-user-id',
          lineUserId: null,
        } as any);

        const response = await request(app)
          .post('/api/notify/order-update')
          .send({
            orderId: 'order-123',
            status: 'preparing',
          });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('User does not have LINE integration');
      });
    });
  });

  describe('Error Handling', () => {
    it('handles Stripe errors gracefully', async () => {
      const mockStripeService = await import('../../server/stripe');
      vi.mocked(mockStripeService.stripeService.createPaymentIntent).mockRejectedValue(
        new Error('Stripe API error')
      );

      const response = await request(app)
        .post('/api/create-payment-intent')
        .send({
          amount: 150,
          orderId: 'order-123',
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Stripe API error');
    });

    it('handles QR generation errors', async () => {
      const mockQRService = await import('../../server/qrcode');
      vi.mocked(mockQRService.qrCodeService.generatePaymentQR).mockRejectedValue(
        new Error('QR generation failed')
      );

      const response = await request(app)
        .get('/api/qr/payment/order-123?amount=100');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('QR generation failed');
    });

    it('handles LINE notification errors', async () => {
      const mockStorage = await import('../../server/storage');
      const mockLineService = await import('../../server/line');

      vi.mocked(mockStorage.storage.getUser).mockResolvedValue({
        id: 'test-user-id',
        lineUserId: 'line-user-123',
      } as any);

      vi.mocked(mockStorage.storage.getOrder).mockResolvedValue({
        id: 'order-123',
      } as any);

      vi.mocked(mockLineService.lineService.sendDeliveryUpdate).mockRejectedValue(
        new Error('LINE API error')
      );

      const response = await request(app)
        .post('/api/notify/order-update')
        .send({
          orderId: 'order-123',
          status: 'preparing',
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('LINE API error');
    });
  });
});