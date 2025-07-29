import {
  users,
  restaurants,
  menus,
  orders,
  orderItems,
  reviews,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
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
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
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
    return result.rowCount > 0;
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
  
  async createOrder(order: InsertOrder): Promise<Order> {
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
}

export const storage = new DatabaseStorage();
