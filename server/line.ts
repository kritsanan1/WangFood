import axios from 'axios';

interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

interface LineAuthResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
}

export class LineService {
  private channelId: string;
  private channelSecret: string;
  private channelAccessToken: string;
  private redirectUri: string;

  constructor() {
    this.channelId = process.env.LINE_CHANNEL_ID!;
    this.channelSecret = process.env.LINE_CHANNEL_SECRET!;
    this.channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN!;
    this.redirectUri = process.env.NODE_ENV === 'production' 
      ? `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}/api/auth/line/callback`
      : `http://localhost:5000/api/auth/line/callback`;
  }

  getAuthUrl(): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.channelId,
      redirect_uri: this.redirectUri,
      state: 'line_login',
      scope: 'profile openid email',
    });
    
    return `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<LineAuthResponse> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
      client_id: this.channelId,
      client_secret: this.channelSecret,
    });

    const response = await axios.post(
      'https://api.line.me/oauth2/v2.1/token',
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data;
  }

  async getProfile(accessToken: string): Promise<LineProfile> {
    const response = await axios.get('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  }

  async sendMessage(userId: string, message: string): Promise<void> {
    await axios.post(
      'https://api.line.me/v2/bot/message/push',
      {
        to: userId,
        messages: [{
          type: 'text',
          text: message,
        }],
      },
      {
        headers: {
          Authorization: `Bearer ${this.channelAccessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  async sendOrderNotification(userId: string, orderData: any): Promise<void> {
    const message = `🍽️ Order Confirmation - Tourderwang

Order ID: ${orderData.id}
Restaurant: ${orderData.restaurantName}
Total: ฿${orderData.totalAmount}
Status: ${orderData.status}

Thank you for ordering with Tourderwang! 🐊`;

    await this.sendMessage(userId, message);
  }

  async sendDeliveryUpdate(userId: string, orderData: any): Promise<void> {
    const message = `🚚 Delivery Update - Tourderwang

Order ID: ${orderData.id}
Status: ${orderData.status}
Estimated Delivery: ${orderData.estimatedDeliveryTime}

Your delicious food is on the way! 🐊`;

    await this.sendMessage(userId, message);
  }
}

export const lineService = new LineService();