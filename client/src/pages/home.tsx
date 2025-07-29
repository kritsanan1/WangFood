import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RestaurantCard from "@/components/RestaurantCard";
import MenuItemCard from "@/components/MenuItemCard";
import ShoppingCart from "@/components/ShoppingCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Clock, Utensils, Coffee, IceCream, Pizza } from "lucide-react";
import type { Restaurant, Menu } from "@shared/schema";

const categories = [
  { id: "all", name: "ทั้งหมด", icon: Utensils },
  { id: "thai", name: "อาหารไทย", icon: Utensils },
  { id: "drinks", name: "เครื่องดื่ม", icon: Coffee },
  { id: "dessert", name: "ของหวาน", icon: IceCream },
  { id: "western", name: "อาหารฝรั่ง", icon: Pizza },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { data: restaurants, isLoading: restaurantsLoading } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants"],
  });

  const { data: popularDishes, isLoading: dishesLoading } = useQuery<Menu[]>({
    queryKey: ["/api/popular-dishes"],
  });

  const filteredRestaurants = restaurants?.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || restaurant.cuisineType === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-tourderwang-background font-thai">
      <Navbar onCartClick={() => setIsCartOpen(true)} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-400 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">อร่อยใส่ใจ ส่งถึงบ้าน</h2>
            <p className="text-xl mb-4">บริการส่งอาหารในวังสามหมอ อุดรธานี</p>
            <div className="flex items-center justify-center space-x-2 text-sm">
              <MapPin className="h-4 w-4" />
              <span>พื้นที่บริการ: วังสามหมอ, อุดรธานี</span>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Categories */}
        <section className="mb-8">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="ค้นหาร้านอาหาร หรือเมนู..."
              className="pl-10 pr-4 py-3 w-full rounded-full border-gray-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <h3 className="text-lg font-semibold mb-4">หมวดหมู่อาหาร</h3>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className={`flex-shrink-0 ${
                    selectedCategory === category.id
                      ? "tourderwang-primary text-white"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </section>

        {/* Promotion Banner */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-green-500 to-green-400 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">โปรโมชั่นวันนี้</h3>
                <p className="text-sm opacity-90">ฟรีค่าส่ง สำหรับออเดอร์แรก!</p>
              </div>
              <div className="text-right">
                <div className="bg-white text-green-600 px-3 py-1 rounded-full text-sm font-semibold">
                  ส่วนลด 50%
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Restaurant Grid */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">ร้านอาหารแนะนำ</h3>
          </div>
          
          {restaurantsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md h-64 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants?.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )}
        </section>

        {/* Popular Dishes */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-6">เมนูยอดนิยม</h3>
          {dishesLoading ? (
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-64 bg-white rounded-xl shadow-md h-48 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {popularDishes?.map((dish) => (
                <MenuItemCard key={dish.id} menuItem={dish} />
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
