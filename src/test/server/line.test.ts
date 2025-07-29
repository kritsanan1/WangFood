import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LineService } from '../../server/line';

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('LineService', () => {
  let lineService: LineService;
  const mockAxios = vi.mocked(await import('axios')).default;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up environment variables
    process.env.LINE_CHANNEL_ID = 'test_channel_id';
    process.env.LINE_CHANNEL_SECRET = 'test_channel_secret';
    process.env.LINE_CHANNEL_ACCESS_TOKEN = 'test_access_token';
    process.env.NODE_ENV = 'development';

    lineService = new LineService();
  });

  describe('getAuthUrl', () => {
    it('generates correct LINE OAuth URL', () => {
      const authUrl = lineService.getAuthUrl();

      expect(authUrl).toContain('https://access.line.me/oauth2/v2.1/authorize');
      expect(authUrl).toContain('response_type=code');
      expect(authUrl).toContain('client_id=test_channel_id');
      expect(authUrl).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Fapi%2Fauth%2Fline%2Fcallback');
      expect(authUrl).toContain('state=line_login');
      expect(authUrl).toContain('scope=profile%20openid%20email');
    });

    it('uses production URL when in production environment', () => {
      process.env.NODE_ENV = 'production';
      process.env.REPLIT_DOMAINS = 'tourderwang.replit.app';
      
      const lineService = new LineService();
      const authUrl = lineService.getAuthUrl();

      expect(authUrl).toContain('redirect_uri=https%3A%2F%2Ftourderwang.replit.app%2Fapi%2Fauth%2Fline%2Fcallback');
    });
  });

  describe('exchangeCodeForToken', () => {
    it('exchanges authorization code for access token', async () => {
      const mockTokenResponse = {
        access_token: 'test_access_token',
        token_type: 'Bearer',
        refresh_token: 'test_refresh_token',
        expires_in: 3600,
        scope: 'profile openid email',
      };

      mockAxios.post.mockResolvedValue({ data: mockTokenResponse });

      const result = await lineService.exchangeCodeForToken('test_auth_code');

      expect(mockAxios.post).toHaveBeenCalledWith(
        'https://api.line.me/oauth2/v2.1/token',
        expect.any(URLSearchParams),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      // Verify the form data
      const formData = mockAxios.post.mock.calls[0][1] as URLSearchParams;
      expect(formData.get('grant_type')).toBe('authorization_code');
      expect(formData.get('code')).toBe('test_auth_code');
      expect(formData.get('client_id')).toBe('test_channel_id');
      expect(formData.get('client_secret')).toBe('test_channel_secret');

      expect(result).toEqual(mockTokenResponse);
    });
  });

  describe('getProfile', () => {
    it('retrieves LINE user profile', async () => {
      const mockProfile = {
        userId: 'line_user_123',
        displayName: 'Test User',
        pictureUrl: 'https://example.com/profile.jpg',
        statusMessage: 'Hello from LINE',
      };

      mockAxios.get.mockResolvedValue({ data: mockProfile });

      const result = await lineService.getProfile('test_access_token');

      expect(mockAxios.get).toHaveBeenCalledWith(
        'https://api.line.me/v2/profile',
        {
          headers: {
            Authorization: 'Bearer test_access_token',
          },
        }
      );

      expect(result).toEqual(mockProfile);
    });
  });

  describe('sendMessage', () => {
    it('sends message to LINE user', async () => {
      mockAxios.post.mockResolvedValue({ data: {} });

      await lineService.sendMessage('line_user_123', 'Test message');

      expect(mockAxios.post).toHaveBeenCalledWith(
        'https://api.line.me/v2/bot/message/push',
        {
          to: 'line_user_123',
          messages: [{
            type: 'text',
            text: 'Test message',
          }],
        },
        {
          headers: {
            Authorization: 'Bearer test_access_token',
            'Content-Type': 'application/json',
          },
        }
      );
    });
  });

  describe('sendOrderNotification', () => {
    it('sends formatted order notification', async () => {
      mockAxios.post.mockResolvedValue({ data: {} });

      const orderData = {
        id: 'order-123',
        restaurantName: 'Thai Restaurant',
        totalAmount: 250,
        status: 'confirmed',
      };

      await lineService.sendOrderNotification('line_user_123', orderData);

      expect(mockAxios.post).toHaveBeenCalledWith(
        'https://api.line.me/v2/bot/message/push',
        {
          to: 'line_user_123',
          messages: [{
            type: 'text',
            text: expect.stringContaining('🍽️ Order Confirmation - Tourderwang'),
          }],
        },
        expect.any(Object)
      );

      // Verify message content
      const messageData = mockAxios.post.mock.calls[0][1];
      const messageText = messageData.messages[0].text;
      
      expect(messageText).toContain('Order ID: order-123');
      expect(messageText).toContain('Restaurant: Thai Restaurant');
      expect(messageText).toContain('Total: ฿250');
      expect(messageText).toContain('Status: confirmed');
      expect(messageText).toContain('🐊'); // Tourderwang crocodile emoji
    });
  });

  describe('sendDeliveryUpdate', () => {
    it('sends formatted delivery update notification', async () => {
      mockAxios.post.mockResolvedValue({ data: {} });

      const orderData = {
        id: 'order-456',
        status: 'delivering',
        estimatedDeliveryTime: new Date('2024-01-01T12:30:00Z'),
      };

      await lineService.sendDeliveryUpdate('line_user_456', orderData);

      expect(mockAxios.post).toHaveBeenCalledWith(
        'https://api.line.me/v2/bot/message/push',
        {
          to: 'line_user_456',
          messages: [{
            type: 'text',
            text: expect.stringContaining('🚚 Delivery Update - Tourderwang'),
          }],
        },
        expect.any(Object)
      );

      // Verify message content
      const messageData = mockAxios.post.mock.calls[0][1];
      const messageText = messageData.messages[0].text;
      
      expect(messageText).toContain('Order ID: order-456');
      expect(messageText).toContain('Status: delivering');
      expect(messageText).toContain('Your delicious food is on the way! 🐊');
    });
  });

  describe('error handling', () => {
    it('handles network errors gracefully', async () => {
      mockAxios.post.mockRejectedValue(new Error('Network error'));

      await expect(
        lineService.sendMessage('user_123', 'test message')
      ).rejects.toThrow('Network error');
    });

    it('handles invalid access token', async () => {
      mockAxios.get.mockRejectedValue({
        response: { status: 401, data: { error: 'Invalid access token' } }
      });

      await expect(
        lineService.getProfile('invalid_token')
      ).rejects.toBeTruthy();
    });
  });
});