import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MenuItemCard from "@/components/MenuItemCard";
import ShoppingCart from "@/components/ShoppingCart";
import ReviewWidget from "@/components/ReviewWidget";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Clock, Bike, MapPin, Phone } from "lucide-react";
import type { Restaurant, Menu, Review } from "@shared/schema";

export default function RestaurantDetail() {
  const [, params] = useRoute("/restaurant/:id");
  const restaurantId = params?.id;
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { data: restaurant, isLoading: restaurantLoading } = useQuery<Restaurant>({
    queryKey: ["/api/restaurants", restaurantId],
    enabled: !!restaurantId,
  });

  const { data: menus, isLoading: menusLoading } = useQuery<Menu[]>({
    queryKey: ["/api/restaurants", restaurantId, "menus"],
    enabled: !!restaurantId,
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: ["/api/restaurants", restaurantId, "reviews"],
    enabled: !!restaurantId,
  });

  if (restaurantLoading) {
    return (
      <div className="min-h-screen bg-tourderwang-background font-thai">
        <Navbar onCartClick={() => setIsCartOpen(true)} />
        <div className="animate-pulse">
          <div className="h-64 bg-gray-300" />
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="h-8 bg-gray-300 rounded mb-4" />
            <div className="h-4 bg-gray-300 rounded mb-2 w-1/2" />
            <div className="h-4 bg-gray-300 rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-tourderwang-background font-thai">
        <Navbar onCartClick={() => setIsCartOpen(true)} />
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ไม่พบร้านอาหาร</h1>
          <p className="text-gray-600">ร้านอาหารที่คุณต้องการหาไม่มีอยู่ในระบบ</p>
        </div>
      </div>
    );
  }

  const categories = ["all", ...new Set(menus?.map(menu => menu.category) || [])];
  const filteredMenus = selectedCategory === "all" 
    ? menus 
    : menus?.filter(menu => menu.category === selectedCategory);

  return (
    <div className="min-h-screen bg-tourderwang-background font-thai">
      <Navbar onCartClick={() => setIsCartOpen(true)} />
      
      {/* Restaurant Header */}
      <section className="relative">
        <div className="h-64 bg-gradient-to-r from-orange-500 to-orange-400 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-white">
              <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
              <p className="text-lg mb-4">{restaurant.description}</p>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 text-yellow-300 fill-current" />
                  <span className="font-medium">{restaurant.rating}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-5 w-5" />
                  <span>{restaurant.deliveryTime}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Bike className="h-5 w-5" />
                  <span>{restaurant.deliveryFee === 0 ? "ฟรี" : `${restaurant.deliveryFee} บาท`}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Restaurant Info */}
      <section className="py-6 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>{restaurant.address}</span>
            </div>
            {restaurant.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>{restaurant.phone}</span>
              </div>
            )}
            <Badge variant="secondary">{restaurant.cuisineType}</Badge>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Menu Categories */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">เมนูอาหาร</h3>
          <div className="flex space-x-4 overflow-x-auto pb-2 mb-6">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`flex-shrink-0 ${
                  selectedCategory === category
                    ? "tourderwang-primary text-white"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category === "all" ? "ทั้งหมด" : category}
              </Button>
            ))}
          </div>

          {menusLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md h-48 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenus?.map((menu) => (
                <MenuItemCard key={menu.id} menuItem={menu} />
              ))}
            </div>
          )}
        </section>

        {/* Reviews Section */}
        <section>
          <h3 className="text-xl font-semibold mb-6">รีวิวจากลูกค้า</h3>
          
          <ReviewWidget restaurantId={restaurant.id} />

          {reviewsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-300 rounded mb-2" />
                    <div className="h-4 bg-gray-300 rounded mb-4 w-3/4" />
                    <div className="h-3 bg-gray-300 rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {reviews?.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "text-yellow-500 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-500 ml-2">{review.rating}.0</span>
                    </div>
                    <p className="text-gray-700 mb-2">{review.comment}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('th-TH')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
      <ShoppingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
