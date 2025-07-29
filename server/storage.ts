import {
  users,
  restaurants,
  menus,
  orders,
  orderItems,
  reviews,
  cartItems,
  type User,
  type UpsertUser,
  type Restaurant,
  type InsertRestaurant,
  type Menu,
  type InsertMenu,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Review,
  type InsertReview,
  type CartItem,
  type InsertCartItem,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Restaurant operations
  getRestaurants(): Promise<Restaurant[]>;
  getRestaurant(id: string): Promise<Restaurant | undefined>;
  getRestaurantsByOwner(ownerId: string): Promise<Restaurant[]>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  updateRestaurant(id: string, restaurant: Partial<InsertRestaurant>): Promise<Restaurant | undefined>;
  
  // Menu operations
  getMenusByRestaurant(restaurantId: string): Promise<Menu[]>;
  getMenu(id: string): Promise<Menu | undefined>;
  createMenu(menu: InsertMenu): Promise<Menu>;
  updateMenu(id: string, menu: Partial<InsertMenu>): Promise<Menu | undefined>;
  deleteMenu(id: string): Promise<boolean>;
  
  // Order operations
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  getOrdersByRestaurant(restaurantId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  
  // Order item operations
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Review operations
  getReviewsByRestaurant(restaurantId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Popular dishes
  getPopularDishes(): Promise<Menu[]>;
  
  // Cart operations
  getUserCartItems(userId: string): Promise<(CartItem & { menu: Menu & { restaurant: Restaurant } })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, userId: string, updates: Partial<InsertCartItem>): Promise<CartItem | undefined>;
  removeFromCart(id: string, userId: string): Promise<boolean>;
  clearUserCart(userId: string): Promise<boolean>;
  
  // Enhanced order operations
  getUserOrders(userId: string): Promise<Order[]>;
  getOrderById(id: string, userId: string): Promise<Order | undefined>;
  createOrder(orderData: any): Promise<Order>;
  createOrderFromCart(order: InsertOrder): Promise<Order>;
  
  // Search operations
  searchRestaurantsAndMenus(params: { query?: string; category?: string; minRating?: number }): Promise<{ restaurants: Restaurant[]; menus: (Menu & { restaurant: Restaurant })[] }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
  
  // Restaurant operations
  async getRestaurants(): Promise<Restaurant[]> {
    return await db.select().from(restaurants).where(eq(restaurants.isActive, true)).orderBy(desc(restaurants.rating));
  }
  
  async getRestaurant(id: string): Promise<Restaurant | undefined> {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, id));
    return restaurant;
  }
  
  async getRestaurantsByOwner(ownerId: string): Promise<Restaurant[]> {
    return await db.select().from(restaurants).where(eq(restaurants.ownerId, ownerId));
  }
  
  async createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant> {
    const [newRestaurant] = await db.insert(restaurants).values(restaurant).returning();
    return newRestaurant;
  }
  
  async updateRestaurant(id: string, restaurant: Partial<InsertRestaurant>): Promise<Restaurant | undefined> {
    const [updated] = await db
      .update(restaurants)
      .set({ ...restaurant, updatedAt: new Date() })
      .where(eq(restaurants.id, id))
      .returning();
    return updated;
  }
  
  // Menu operations
  async getMenusByRestaurant(restaurantId: string): Promise<Menu[]> {
    return await db.select().from(menus).where(and(eq(menus.restaurantId, restaurantId), eq(menus.isAvailable, true)));
  }
  
  async getMenu(id: string): Promise<Menu | undefined> {
    const [menu] = await db.select().from(menus).where(eq(menus.id, id));
    return menu;
  }
  
  async createMenu(menu: InsertMenu): Promise<Menu> {
    const [newMenu] = await db.insert(menus).values(menu).returning();
    return newMenu;
  }
  
  async updateMenu(id: string, menu: Partial<InsertMenu>): Promise<Menu | undefined> {
    const [updated] = await db
      .update(menus)
      .set({ ...menu, updatedAt: new Date() })
      .where(eq(menus.id, id))
      .returning();
    return updated;
  }
  
  async deleteMenu(id: string): Promise<boolean> {
    const result = await db.delete(menus).where(eq(menus.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  
  // Order operations
  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }
  
  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }
  
  async getOrdersByUser(userId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }
  
  async getOrdersByRestaurant(restaurantId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.restaurantId, restaurantId)).orderBy(desc(orders.createdAt));
  }
  
  async createOrderFromCart(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }
  
  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const [updated] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }
  
  // Order item operations
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }
  
  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [newOrderItem] = await db.insert(orderItems).values(orderItem).returning();
    return newOrderItem;
  }
  
  // Review operations
  async getReviewsByRestaurant(restaurantId: string): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.restaurantId, restaurantId)).orderBy(desc(reviews.createdAt));
  }
  
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    
    // Update restaurant rating
    const avgRating = await db
      .select({ avg: sql`AVG(${reviews.rating})` })
      .from(reviews)
      .where(eq(reviews.restaurantId, review.restaurantId));
    
    if (avgRating[0]?.avg) {
      await db
        .update(restaurants)
        .set({ rating: Number(avgRating[0].avg).toFixed(2) })
        .where(eq(restaurants.id, review.restaurantId));
    }
    
    return newReview;
  }
  
  // Popular dishes
  async getPopularDishes(): Promise<Menu[]> {
    // Get popular dishes based on order frequency
    return await db
      .select({
        id: menus.id,
        restaurantId: menus.restaurantId,
        itemName: menus.itemName,
        description: menus.description,
        price: menus.price,
        imageUrl: menus.imageUrl,
        category: menus.category,
        isAvailable: menus.isAvailable,
        createdAt: menus.createdAt,
        updatedAt: menus.updatedAt,
      })
      .from(menus)
      .leftJoin(orderItems, eq(menus.id, orderItems.menuId))
      .where(eq(menus.isAvailable, true))
      .groupBy(menus.id)
      .orderBy(desc(sql`COUNT(${orderItems.id})`))
      .limit(8);
  }

  // Cart operations
  async getUserCartItems(userId: string): Promise<(CartItem & { menu: Menu & { restaurant: Restaurant } })[]> {
    const items = await db
      .select()
      .from(cartItems)
      .leftJoin(menus, eq(cartItems.menuId, menus.id))
      .leftJoin(restaurants, eq(menus.restaurantId, restaurants.id))
      .where(eq(cartItems.userId, userId));
    
    return items
      .filter(item => item.menus && item.restaurants)
      .map(item => ({
        ...item.cart_items,
        menu: {
          ...item.menus!,
          restaurant: item.restaurants!
        }
      }));
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart, if so update quantity
    const existing = await db
      .select()
      .from(cartItems)
      .where(and(
        eq(cartItems.userId, cartItem.userId!),
        eq(cartItems.menuId, cartItem.menuId!)
      ))
      .limit(1);
    
    if (existing.length > 0) {
      const [updated] = await db
        .update(cartItems)
        .set({
          quantity: existing[0].quantity + (cartItem.quantity || 1),
          updatedAt: new Date()
        })
        .where(eq(cartItems.id, existing[0].id))
        .returning();
      return updated;
    }
    
    const [created] = await db.insert(cartItems).values(cartItem).returning();
    return created;
  }

  async updateCartItem(id: string, userId: string, updates: Partial<InsertCartItem>): Promise<CartItem | undefined> {
    const [updated] = await db
      .update(cartItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(cartItems.id, id), eq(cartItems.userId, userId)))
      .returning();
    return updated;
  }

  async removeFromCart(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(cartItems)
      .where(and(eq(cartItems.id, id), eq(cartItems.userId, userId)));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async clearUserCart(userId: string): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.userId, userId));
    return result.rowCount !== null && result.rowCount >= 0;
  }

  // Enhanced order operations  
  async getUserOrders(userId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async getOrderById(id: string, userId: string): Promise<Order | undefined> {
    const [order] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, id), eq(orders.userId, userId)));
    return order;
  }

  async createOrder(orderData: any): Promise<Order> {
    const [order] = await db.insert(orders).values({
      restaurantId: orderData.restaurantId,
      userId: orderData.userId,
      totalAmount: orderData.totalAmount,
      deliveryFee: orderData.deliveryFee || 0,
      status: orderData.status || 'pending',
      deliveryAddress: orderData.deliveryAddress,
      customerNote: orderData.customerNote,
      estimatedDeliveryTime: orderData.estimatedDeliveryTime,
    }).returning();

    // Create order items if provided
    if (orderData.items && orderData.items.length > 0) {
      await db.insert(orderItems).values(
        orderData.items.map((item: any) => ({
          orderId: order.id,
          menuId: item.menuId,
          quantity: item.quantity,
          price: item.price,
          specialInstructions: item.specialInstructions
        }))
      );
    }

    return order;
  }

  // Search operations
  async searchRestaurantsAndMenus(params: { query?: string; category?: string; minRating?: number }): Promise<{ restaurants: Restaurant[]; menus: (Menu & { restaurant: Restaurant })[] }> {
    const baseRestaurantQuery = db.select().from(restaurants);
    const baseMenuQuery = db.select().from(menus).leftJoin(restaurants, eq(menus.restaurantId, restaurants.id));

    let restaurantConditions = [eq(restaurants.isActive, true)];
    let menuConditions = [eq(menus.isAvailable, true)];

    if (params.query) {
      const searchTerm = `%${params.query}%`;
      restaurantConditions.push(
        sql`${restaurants.name} ILIKE ${searchTerm} OR ${restaurants.description} ILIKE ${searchTerm} OR ${restaurants.cuisineType} ILIKE ${searchTerm}`
      );
      menuConditions.push(
        sql`${menus.itemName} ILIKE ${searchTerm} OR ${menus.description} ILIKE ${searchTerm} OR ${menus.category} ILIKE ${searchTerm}`
      );
    }

    if (params.category) {
      restaurantConditions.push(sql`${restaurants.cuisineType} ILIKE ${`%${params.category}%`}`);
      menuConditions.push(sql`${menus.category} ILIKE ${`%${params.category}%`}`);
    }

    if (params.minRating) {
      restaurantConditions.push(sql`${restaurants.rating} >= ${params.minRating}`);
    }

    const restaurantResults = await baseRestaurantQuery.where(and(...restaurantConditions));
    const menuResults = await baseMenuQuery.where(and(...menuConditions));

    return {
      restaurants: restaurantResults,
      menus: menuResults
        .filter(result => result.restaurants)
        .map(result => ({
          ...result.menus!,
          restaurant: result.restaurants!
        }))
    };
  }
}

export const storage = new DatabaseStorage();
