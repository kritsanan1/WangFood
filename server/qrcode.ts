import QRCode from 'qrcode';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

export class QRCodeService {
  async generatePaymentQR(paymentData: {
    amount: number;
    orderId: string;
    restaurantName: string;
    paymentMethod: 'promptpay' | 'truewallet' | 'stripe';
  }, options: QRCodeOptions = {}): Promise<string> {
    let qrData: string;

    switch (paymentData.paymentMethod) {
      case 'promptpay':
        // PromptPay QR format for Thailand
        qrData = this.generatePromptPayQR(paymentData.amount, paymentData.orderId);
        break;
      case 'truewallet':
        // TrueWallet QR format
        qrData = this.generateTrueWalletQR(paymentData.amount, paymentData.orderId);
        break;
      case 'stripe':
        // Stripe payment link QR
        qrData = `${process.env.NODE_ENV === 'production' 
          ? `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}` 
          : 'http://localhost:5000'}/payment/${paymentData.orderId}`;
        break;
      default:
        throw new Error('Unsupported payment method');
    }

    const qrOptions = {
      width: options.width || 256,
      margin: options.margin || 2,
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#FFFFFF',
      },
    };

    return await QRCode.toDataURL(qrData, qrOptions);
  }

  async generateTableQR(restaurantId: string, tableNumber: string): Promise<string> {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}` 
      : 'http://localhost:5000';
    
    const qrData = `${baseUrl}/restaurant/${restaurantId}/table/${tableNumber}`;
    
    return await QRCode.toDataURL(qrData, {
      width: 256,
      margin: 2,
      color: {
        dark: '#FF6B35', // Tourderwang orange color
        light: '#FFFFFF',
      },
    });
  }

  async generateOrderTrackingQR(orderId: string): Promise<string> {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}` 
      : 'http://localhost:5000';
    
    const qrData = `${baseUrl}/track-order/${orderId}`;
    
    return await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 1,
      color: {
        dark: '#FF6B35',
        light: '#FFFFFF',
      },
    });
  }

  private generatePromptPayQR(amount: number, reference: string): string {
    // PromptPay QR Code format (EMV QR Code specification)
    // This is a simplified version - in production, you'd use a proper PromptPay library
    const promptPayId = '0123456789'; // Replace with actual PromptPay ID
    
    // Basic EMV QR format for PromptPay
    const qrData = [
      '00020101021230', // Version and merchant type
      '2937', // PromptPay tag
      '000A', // Length
      '0016A000000677010111', // PromptPay identifier
      '01', // Type: mobile number
      `${promptPayId.length.toString().padStart(2, '0')}${promptPayId}`, // PromptPay ID
      '5802TH', // Country code
      `54${amount.toFixed(2).length.toString().padStart(2, '0')}${amount.toFixed(2)}`, // Amount
      '5802TH', // Currency (Thai Baht)
      '62', // Additional data
      `${reference.length.toString().padStart(2, '0')}${reference}`, // Reference
    ].join('');

    return qrData;
  }

  private generateTrueWalletQR(amount: number, reference: string): string {
    // TrueWallet QR format (simplified)
    return `truewallet://pay?amount=${amount}&ref=${reference}`;
  }

  async generateMenuQR(restaurantId: string, menuId: string): Promise<string> {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}` 
      : 'http://localhost:5000';
    
    const qrData = `${baseUrl}/restaurant/${restaurantId}/menu/${menuId}`;
    
    return await QRCode.toDataURL(qrData, {
      width: 150,
      margin: 1,
      color: {
        dark: '#FF6B35',
        light: '#FFFFFF',
      },
    });
  }
}

export const qrCodeService = new QRCodeService();