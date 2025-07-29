import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertRestaurantSchema, insertMenuSchema, insertOrderSchema, insertOrderItemSchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

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

  const httpServer = createServer(app);
  return httpServer;
}
