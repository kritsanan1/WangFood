import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Auth endpoints
  http.get('/api/auth/user', () => {
    return HttpResponse.json({
      id: 'test-user-id',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      profileImageUrl: 'https://example.com/avatar.jpg',
      lineUserId: 'line-test-user',
      googleId: 'google-test-user',
    });
  }),

  // Stripe payment endpoints
  http.post('/api/create-payment-intent', () => {
    return HttpResponse.json({
      clientSecret: 'pi_test_mock_client_secret',
      paymentIntentId: 'pi_test_mock_id',
    });
  }),

  http.post('/api/confirm-payment', () => {
    return HttpResponse.json({
      success: true,
      status: 'confirmed',
    });
  }),

  // QR Code endpoints
  http.get('/api/qr/payment/:orderId', () => {
    return HttpResponse.json({
      qrCode: 'data:image/svg+xml;base64,mock_qr_code_data',
    });
  }),

  http.get('/api/qr/table/:restaurantId/:tableNumber', () => {
    return HttpResponse.json({
      qrCode: 'data:image/svg+xml;base64,mock_table_qr_code',
    });
  }),

  http.get('/api/qr/track/:orderId', () => {
    return HttpResponse.json({
      qrCode: 'data:image/svg+xml;base64,mock_tracking_qr_code',
    });
  }),

  // LINE notification endpoints
  http.post('/api/notify/order-update', () => {
    return HttpResponse.json({
      success: true,
    });
  }),

  // Restaurant endpoints
  http.get('/api/restaurants', () => {
    return HttpResponse.json([
      {
        id: 'rest-1',
        name: 'ร้านอาหารไทย',
        cuisineType: 'thai',
        rating: '4.5',
        deliveryTime: '20-30',
        imageUrl: 'https://example.com/restaurant.jpg',
      },
    ]);
  }),

  http.get('/api/popular-dishes', () => {
    return HttpResponse.json([
      {
        id: 'dish-1',
        itemName: 'ผัดไทย',
        price: 80,
        description: 'ผัดไทยแท้รสชาติต้นตำรับ',
        category: 'thai',
        isAvailable: true,
      },
    ]);
  }),

  http.get('/api/cart', () => {
    return HttpResponse.json([]);
  }),
];

export const server = setupServer(...handlers);