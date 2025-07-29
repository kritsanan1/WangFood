import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { setupGoogleAuth } from "./googleAuth";
import { lineService } from "./line";
import { stripeService, stripe } from "./stripe";
import { qrCodeService } from "./qrcode";
import passport from "passport";
import { insertRestaurantSchema, insertMenuSchema, insertOrderSchema, insertOrderItemSchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  setupGoogleAuth();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Google OAuth routes
  app.get('/api/auth/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login?error=google_auth_failed' }),
    (req, res) => {
      res.redirect('/'); // Redirect to home after successful login
    }
  );

  // LINE OAuth routes
  app.get('/api/auth/line', (req, res) => {
    const authUrl = lineService.getAuthUrl();
    res.redirect(authUrl);
  });

  app.get('/api/auth/line/callback', async (req, res) => {
    try {
      const { code, state } = req.query;
      
      if (!code || state !== 'line_login') {
        return res.redirect('/login?error=line_auth_failed');
      }

      const tokenResponse = await lineService.exchangeCodeForToken(code as string);
      const profile = await lineService.getProfile(tokenResponse.access_token);

      // Create or update user with LINE info
      const user = await storage.upsertUser({
        id: profile.userId,
        lineUserId: profile.userId,
        firstName: profile.displayName,
        profileImageUrl: profile.pictureUrl,
      });

      // Create session for LINE user
      req.login(user, (err) => {
        if (err) {
          console.error('Session creation error:', err);
          return res.redirect('/login?error=session_failed');
        }
        res.redirect('/');
      });
    } catch (error) {
      console.error('LINE auth error:', error);
      res.redirect('/login?error=line_auth_failed');
    }
  });

  // Restaurant routes
  app.get('/api/restaurants', async (req, res) => {
    try {
      const restaurants = await storage.getRestaurants();
      res.json(restaurants);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      res.status(500).json({ message: "Failed to fetch restaurants" });
    }
  });

  app.get('/api/restaurants/:id', async (req, res) => {
    try {
      const restaurant = await storage.getRestaurant(req.params.id);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      res.json(restaurant);
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      res.status(500).json({ message: "Failed to fetch restaurant" });
    }
  });

  app.post('/api/restaurants', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const restaurantData = insertRestaurantSchema.parse({
        ...req.body,
        ownerId: userId
      });
      const restaurant = await storage.createRestaurant(restaurantData);
      res.status(201).json(restaurant);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid restaurant data", errors: error.errors });
      }
      console.error("Error creating restaurant:", error);
      res.status(500).json({ message: "Failed to create restaurant" });
    }
  });

  app.get('/api/restaurants/:restaurantId/menus', async (req, res) => {
    try {
      const menus = await storage.getMenusByRestaurant(req.params.restaurantId);
      res.json(menus);
    } catch (error) {
      console.error("Error fetching menus:", error);
      res.status(500).json({ message: "Failed to fetch menus" });
    }
  });

  app.post('/api/restaurants/:restaurantId/menus', isAuthenticated, async (req: any, res) => {
    try {
      const menuData = insertMenuSchema.parse({
        ...req.body,
        restaurantId: req.params.restaurantId
      });
      const menu = await storage.createMenu(menuData);
      res.status(201).json(menu);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid menu data", errors: error.errors });
      }
      console.error("Error creating menu:", error);
      res.status(500).json({ message: "Failed to create menu" });
    }
  });

  app.put('/api/menus/:id', isAuthenticated, async (req: any, res) => {
    try {
      const menuData = insertMenuSchema.partial().parse(req.body);
      const menu = await storage.updateMenu(req.params.id, menuData);
      if (!menu) {
        return res.status(404).json({ message: "Menu not found" });
      }
      res.json(menu);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid menu data", errors: error.errors });
      }
      console.error("Error updating menu:", error);
      res.status(500).json({ message: "Failed to update menu" });
    }
  });

  app.delete('/api/menus/:id', isAuthenticated, async (req: any, res) => {
    try {
      const success = await storage.deleteMenu(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Menu not found" });
      }
      res.json({ message: "Menu deleted successfully" });
    } catch (error) {
      console.error("Error deleting menu:", error);
      res.status(500).json({ message: "Failed to delete menu" });
    }
  });

  // Order routes
  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getOrdersByUser(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const orderItems = await storage.getOrderItems(order.id);
      res.json({ ...order, items: orderItems });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { items, ...orderData } = req.body;
      
      const orderDataWithUser = insertOrderSchema.parse({
        ...orderData,
        userId
      });
      
      const order = await storage.createOrder(orderDataWithUser);
      
      // Create order items
      if (items && Array.isArray(items)) {
        for (const item of items) {
          const orderItemData = insertOrderItemSchema.parse({
            ...item,
            orderId: order.id
          });
          await storage.createOrderItem(orderItemData);
        }
      }
      
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.put('/api/orders/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Restaurant dashboard routes
  app.get('/api/restaurant/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userRestaurants = await storage.getRestaurantsByOwner(userId);
      
      if (userRestaurants.length === 0) {
        return res.json([]);
      }
      
      const orders = await storage.getOrdersByRestaurant(userRestaurants[0].id);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching restaurant orders:", error);
      res.status(500).json({ message: "Failed to fetch restaurant orders" });
    }
  });

  // Review routes
  app.get('/api/restaurants/:restaurantId/reviews', async (req, res) => {
    try {
      const reviews = await storage.getReviewsByRestaurant(req.params.restaurantId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId
      });
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Popular dishes route
  app.get('/api/popular-dishes', async (req, res) => {
    try {
      const dishes = await storage.getPopularDishes();
      res.json(dishes);
    } catch (error) {
      console.error("Error fetching popular dishes:", error);
      res.status(500).json({ message: "Failed to fetch popular dishes" });
    }
  });

  // Cart routes
  app.get('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cartItems = await storage.getUserCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post('/api/cart/add', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { menuId, quantity, specialInstructions } = req.body;
      
      const cartItem = await storage.addToCart({
        userId,
        menuId,
        quantity: quantity || 1,
        specialInstructions: specialInstructions || null
      });
      
      res.json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.put('/api/cart/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const { quantity, specialInstructions } = req.body;
      
      const cartItem = await storage.updateCartItem(id, userId, { quantity, specialInstructions });
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete('/api/cart/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      await storage.removeFromCart(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  // Search routes
  app.get('/api/search', async (req, res) => {
    try {
      const { q, category, minRating } = req.query;
      const results = await storage.searchRestaurantsAndMenus({
        query: q as string,
        category: category as string,
        minRating: minRating ? parseFloat(minRating as string) : undefined
      });
      res.json(results);
    } catch (error) {
      console.error("Error searching:", error);
      res.status(500).json({ message: "Failed to search" });
    }
  });

  // Advanced Payment Routes - Stripe Integration
  app.post('/api/create-payment-intent', isAuthenticated, async (req: any, res) => {
    try {
      const { amount, orderId, paymentMethod = 'stripe' } = req.body;
      const userId = req.user.claims.sub;

      const paymentIntent = await stripeService.createPaymentIntent(
        amount,
        'thb',
        { orderId, userId, paymentMethod }
      );

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error: any) {
      console.error('Payment intent creation error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/confirm-payment', isAuthenticated, async (req: any, res) => {
    try {
      const { paymentIntentId, orderId } = req.body;
      
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        // Update order payment status
        await storage.updateOrderStatus(orderId, 'confirmed');
        
        // Send LINE notification if user has LINE ID
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        const order = await storage.getOrder(orderId);
        
        if (user?.lineUserId && order) {
          await lineService.sendOrderNotification(user.lineUserId, {
            id: order.id,
            restaurantName: 'Restaurant',
            totalAmount: order.totalAmount,
            status: order.status
          });
        }
        
        res.json({ success: true, status: 'confirmed' });
      } else {
        res.json({ success: false, status: paymentIntent.status });
      }
    } catch (error: any) {
      console.error('Payment confirmation error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // QR Code generation routes
  app.get('/api/qr/payment/:orderId', isAuthenticated, async (req: any, res) => {
    try {
      const { orderId } = req.params;
      const { method = 'stripe', amount } = req.query;
      
      const qrCode = await qrCodeService.generatePaymentQR({
        amount: parseFloat(amount as string),
        orderId,
        restaurantName: 'Tourderwang',
        paymentMethod: method as 'promptpay' | 'truewallet' | 'stripe'
      });
      
      res.json({ qrCode });
    } catch (error: any) {
      console.error('QR generation error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/qr/table/:restaurantId/:tableNumber', async (req, res) => {
    try {
      const { restaurantId, tableNumber } = req.params;
      const qrCode = await qrCodeService.generateTableQR(restaurantId, tableNumber);
      res.json({ qrCode });
    } catch (error: any) {
      console.error('Table QR generation error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/qr/track/:orderId', async (req, res) => {
    try {
      const { orderId } = req.params;
      const qrCode = await qrCodeService.generateOrderTrackingQR(orderId);
      res.json({ qrCode });
    } catch (error: any) {
      console.error('Tracking QR generation error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // LINE notification routes
  app.post('/api/notify/order-update', isAuthenticated, async (req: any, res) => {
    try {
      const { orderId, status } = req.body;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const order = await storage.getOrder(orderId);
      
      if (user?.lineUserId && order) {
        await lineService.sendDeliveryUpdate(user.lineUserId, {
          id: order.id,
          status,
          estimatedDeliveryTime: order.estimatedDeliveryTime
        });
        res.json({ success: true });
      } else {
        res.status(400).json({ message: 'User does not have LINE integration' });
      }
    } catch (error: any) {
      console.error('LINE notification error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
