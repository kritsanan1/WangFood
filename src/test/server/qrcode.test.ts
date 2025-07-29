import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QRCodeService } from '../../server/qrcode';

// Mock QRCode library
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn(),
  },
}));

describe('QRCodeService', () => {
  let qrCodeService: QRCodeService;
  const mockQRCode = vi.mocked(await import('qrcode')).default;

  beforeEach(() => {
    vi.clearAllMocks();
    qrCodeService = new QRCodeService();
    mockQRCode.toDataURL.mockResolvedValue('data:image/png;base64,mock_qr_data');
  });

  describe('generatePaymentQR', () => {
    it('generates PromptPay QR code with correct parameters', async () => {
      const paymentData = {
        amount: 150.50,
        orderId: 'order-123',
        restaurantName: 'Test Restaurant',
        paymentMethod: 'promptpay' as const,
      };

      const result = await qrCodeService.generatePaymentQR(paymentData);

      expect(mockQRCode.toDataURL).toHaveBeenCalledWith(
        expect.stringContaining('0123456789'), // PromptPay ID
        expect.objectContaining({
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        })
      );

      expect(result).toBe('data:image/png;base64,mock_qr_data');
    });

    it('generates TrueWallet QR code', async () => {
      const paymentData = {
        amount: 100,
        orderId: 'order-456',
        restaurantName: 'Test Restaurant',
        paymentMethod: 'truewallet' as const,
      };

      await qrCodeService.generatePaymentQR(paymentData);

      expect(mockQRCode.toDataURL).toHaveBeenCalledWith(
        'truewallet://pay?amount=100&ref=order-456',
        expect.any(Object)
      );
    });

    it('generates Stripe payment QR code with correct URL', async () => {
      const paymentData = {
        amount: 200,
        orderId: 'order-789',
        restaurantName: 'Test Restaurant',
        paymentMethod: 'stripe' as const,
      };

      await qrCodeService.generatePaymentQR(paymentData);

      expect(mockQRCode.toDataURL).toHaveBeenCalledWith(
        'http://localhost:5000/payment/order-789',
        expect.any(Object)
      );
    });

    it('applies custom QR code options', async () => {
      const paymentData = {
        amount: 50,
        orderId: 'order-custom',
        restaurantName: 'Test Restaurant',
        paymentMethod: 'stripe' as const,
      };

      const options = {
        width: 300,
        margin: 4,
        color: {
          dark: '#FF6B35',
          light: '#FFFFFF',
        },
      };

      await qrCodeService.generatePaymentQR(paymentData, options);

      expect(mockQRCode.toDataURL).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          width: 300,
          margin: 4,
          color: {
            dark: '#FF6B35',
            light: '#FFFFFF',
          },
        })
      );
    });

    it('throws error for unsupported payment method', async () => {
      const paymentData = {
        amount: 100,
        orderId: 'order-123',
        restaurantName: 'Test Restaurant',
        paymentMethod: 'unsupported' as any,
      };

      await expect(
        qrCodeService.generatePaymentQR(paymentData)
      ).rejects.toThrow('Unsupported payment method');
    });
  });

  describe('generateTableQR', () => {
    it('generates table QR code with restaurant and table info', async () => {
      await qrCodeService.generateTableQR('restaurant-123', 'table-5');

      expect(mockQRCode.toDataURL).toHaveBeenCalledWith(
        'http://localhost:5000/restaurant/restaurant-123/table/table-5',
        expect.objectContaining({
          width: 256,
          margin: 2,
          color: {
            dark: '#FF6B35', // Tourderwang orange
            light: '#FFFFFF',
          },
        })
      );
    });
  });

  describe('generateOrderTrackingQR', () => {
    it('generates order tracking QR code', async () => {
      await qrCodeService.generateOrderTrackingQR('order-tracking-123');

      expect(mockQRCode.toDataURL).toHaveBeenCalledWith(
        'http://localhost:5000/track-order/order-tracking-123',
        expect.objectContaining({
          width: 200,
          margin: 1,
          color: {
            dark: '#FF6B35',
            light: '#FFFFFF',
          },
        })
      );
    });
  });

  describe('generateMenuQR', () => {
    it('generates menu item QR code', async () => {
      await qrCodeService.generateMenuQR('restaurant-456', 'menu-pad-thai');

      expect(mockQRCode.toDataURL).toHaveBeenCalledWith(
        'http://localhost:5000/restaurant/restaurant-456/menu/menu-pad-thai',
        expect.objectContaining({
          width: 150,
          margin: 1,
          color: {
            dark: '#FF6B35',
            light: '#FFFFFF',
          },
        })
      );
    });
  });

  describe('PromptPay QR generation', () => {
    it('generates correct PromptPay EMV format', async () => {
      const paymentData = {
        amount: 123.45,
        orderId: 'test-ref-123',
        restaurantName: 'Test Restaurant',
        paymentMethod: 'promptpay' as const,
      };

      await qrCodeService.generatePaymentQR(paymentData);

      const qrData = mockQRCode.toDataURL.mock.calls[0][0] as string;
      
      // Check that it contains EMV QR code elements
      expect(qrData).toContain('00020101021230'); // Version and merchant type
      expect(qrData).toContain('2937'); // PromptPay tag
      expect(qrData).toContain('0123456789'); // PromptPay ID
      expect(qrData).toContain('5802TH'); // Country code
    });
  });

  describe('URL generation for different environments', () => {
    it('uses production URL when NODE_ENV is production', async () => {
      const originalEnv = process.env.NODE_ENV;
      const originalDomains = process.env.REPLIT_DOMAINS;
      
      process.env.NODE_ENV = 'production';
      process.env.REPLIT_DOMAINS = 'tourderwang.replit.app,custom.domain.com';

      const qrCodeService = new QRCodeService();
      
      await qrCodeService.generateTableQR('rest-123', 'table-1');

      expect(mockQRCode.toDataURL).toHaveBeenCalledWith(
        'https://tourderwang.replit.app/restaurant/rest-123/table/table-1',
        expect.any(Object)
      );

      process.env.NODE_ENV = originalEnv;
      process.env.REPLIT_DOMAINS = originalDomains;
    });

    it('uses localhost for development environment', async () => {
      process.env.NODE_ENV = 'development';

      await qrCodeService.generateOrderTrackingQR('order-dev-123');

      expect(mockQRCode.toDataURL).toHaveBeenCalledWith(
        'http://localhost:5000/track-order/order-dev-123',
        expect.any(Object)
      );
    });
  });
});