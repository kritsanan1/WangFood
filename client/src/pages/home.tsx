import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RestaurantCard from "@/components/RestaurantCard";
import MenuItemCard from "@/components/MenuItemCard";
import ShoppingCart from "@/components/ShoppingCart";
import SearchBar from "@/components/SearchBar";
import AddToCartButton from "@/components/AddToCartButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Clock, Utensils, Coffee, IceCream, Pizza, TrendingUp, Star, Search, Plus } from "lucide-react";
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
      <section className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 text-white py-16 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white opacity-5 rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-white opacity-5 rounded-full"></div>
          <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white opacity-5 rounded-full"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              อร่อยใส่ใจ<br className="md:hidden" /> ส่งถึงบ้าน
            </h2>
            <p className="text-xl md:text-2xl mb-6 opacity-90">
              บริการส่งอาหารในวังสามหมอ อุดรธานี
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm md:text-base mb-8">
              <div className="flex items-center space-x-2 bg-white bg-opacity-20 px-3 py-2 rounded-full">
                <MapPin className="h-4 w-4" />
                <span>วังสามหมอ, อุดรธานี</span>
              </div>
              <div className="flex items-center space-x-2 bg-white bg-opacity-20 px-3 py-2 rounded-full">
                <Clock className="h-4 w-4" />
                <span>ส่งภายใน 30 นาที</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-200">
                เริ่มสั่งอาหาร
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-orange-600 px-8 py-3 rounded-full font-bold">
                ดูเมนูทั้งหมด
              </Button>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Categories */}
        <section className="mb-8">
          <div className="mb-6">
            <SearchBar 
              className="w-full"
              onSearch={(query) => setSearchQuery(query)}
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
        <section className="mb-12">
          <div className="relative bg-gradient-to-r from-green-500 via-green-600 to-emerald-500 rounded-2xl p-8 text-white overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="absolute inset-0 bg-white opacity-5">
              <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-white opacity-20"></div>
              <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-white opacity-20"></div>
            </div>
            <div className="relative flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium uppercase tracking-wider">พิเศษวันนี้</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-2">ฟรีค่าส่ง!</h3>
                <p className="text-lg opacity-90 mb-4">สำหรับออเดอร์แรก มูลค่าขั้นต่ำ 150 บาท</p>
                <Button className="bg-white text-green-600 hover:bg-gray-100 px-6 py-2 rounded-full font-bold shadow-md hover:shadow-lg transition-all duration-200">
                  สั่งเลย!
                </Button>
              </div>
              <div className="hidden md:flex flex-col items-center space-y-3">
                <div className="bg-white text-green-600 px-4 py-2 rounded-full text-lg font-bold shadow-lg">
                  ฟรี 100%
                </div>
                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold animate-bounce">
                  จำกัดเวลา
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Restaurant Grid */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">ร้านอาหารแนะนำ</h3>
              <p className="text-gray-600">ร้านอาหารคุณภาพดี ใกล้บ้านคุณ</p>
            </div>
            <Button variant="outline" className="hidden md:flex">
              ดูทั้งหมด
            </Button>
          </div>
          
          {restaurantsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg h-80 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-2xl"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="flex space-x-2">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRestaurants && filteredRestaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRestaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  onClick={() => window.location.href = `/restaurant/${restaurant.id}`}
                >
                  <div className="relative h-48 overflow-hidden">
                    {restaurant.imageUrl ? (
                      <img
                        src={restaurant.imageUrl}
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-100 via-orange-200 to-orange-300 flex items-center justify-center group-hover:from-orange-200 group-hover:to-orange-400 transition-all duration-300">
                        <span className="text-orange-700 text-4xl font-bold">
                          {restaurant.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    
                    {/* Restaurant Status Badge */}
                    <div className="absolute top-4 left-4">
                      <Badge className={`${
                        restaurant.isActive 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : 'bg-red-500 hover:bg-red-600'
                      } text-white text-xs px-2 py-1 rounded-full shadow-md`}>
                        {restaurant.isActive ? 'เปิดอยู่' : 'ปิด'}
                      </Badge>
                    </div>
                    
                    {/* Delivery Info */}
                    <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 rounded-full px-3 py-1">
                      <div className="flex items-center space-x-1 text-xs text-gray-700">
                        <Clock className="h-3 w-3" />
                        <span>{restaurant.deliveryTime}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-xl text-gray-900 line-clamp-1">
                        {restaurant.name}
                      </h4>
                      <div className="flex items-center space-x-1 text-sm">
                        <span className="text-yellow-500">★</span>
                        <span className="font-semibold text-gray-700">
                          {restaurant.rating || '4.5'}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {restaurant.description}
                    </p>
                    
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-500">
                          {restaurant.cuisineType}
                        </span>
                        <span className="text-orange-600 font-semibold">
                          ฿{restaurant.deliveryFee || 0} ค่าส่ง
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Utensils className="w-12 h-12 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">ไม่พบร้านอาหาร</h4>
              <p className="text-gray-600">ลองค้นหาด้วยคำอื่น หรือเปลี่ยนหมวดหมู่</p>
            </div>
          )}
        </section>

        {/* Popular Dishes */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">เมนูยอดนิยม</h3>
              <p className="text-gray-600">เมนูที่คนในวังสามหมอสั่งมากที่สุด</p>
            </div>
            <Button variant="outline" className="hidden md:flex">
              ดูทั้งหมด
            </Button>
          </div>
          
          {dishesLoading ? (
            <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-72 bg-white rounded-2xl shadow-lg h-64 animate-pulse">
                  <div className="h-40 bg-gray-200 rounded-t-2xl"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : popularDishes && popularDishes.length > 0 ? (
            <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
              {popularDishes.map((dish, index) => (
                <div key={dish.id} className="flex-shrink-0 w-72 group">
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                    <div className="relative">
                      {dish.imageUrl ? (
                        <img
                          src={dish.imageUrl}
                          alt={dish.itemName}
                          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-40 bg-gradient-to-br from-orange-100 via-orange-200 to-orange-300 flex items-center justify-center group-hover:from-orange-200 group-hover:to-orange-400 transition-all duration-300">
                          <span className="text-orange-700 text-3xl font-bold">
                            {dish.itemName.charAt(0)}
                          </span>
                        </div>
                      )}
                      
                      {/* Popular Badge */}
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded-full shadow-md">
                          #{index + 1} ยอดนิยม
                        </Badge>
                      </div>
                      
                      {/* Quick Add Button */}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <AddToCartButton
                          menuId={dish.id}
                          itemName={dish.itemName}
                          price={dish.price}
                          className="bg-white hover:bg-gray-50 text-orange-600 rounded-full w-8 h-8 p-0 shadow-lg"
                        />
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <h4 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
                        {dish.itemName}
                      </h4>
                      {dish.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                          {dish.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-2xl font-bold text-orange-600">
                            ฿{dish.price}
                          </span>
                          <span className="text-xs text-gray-500">ราคาต่อหน่วย</span>
                        </div>
                        <AddToCartButton
                          menuId={dish.id}
                          itemName={dish.itemName}
                          price={dish.price}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Utensils className="w-12 h-12 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">ยังไม่มีเมนูยอดนิยม</h4>
              <p className="text-gray-600">เริ่มสั่งอาหารเพื่อให้เห็นเมนูยอดนิยม</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
      <ShoppingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          size="lg"
          className="w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"
          onClick={() => setIsCartOpen(true)}
        >
          <div className="relative">
            <ShoppingCart className="h-6 w-6" />
            <Badge className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white text-xs h-5 w-5 flex items-center justify-center p-0 rounded-full">
              0
            </Badge>
          </div>
        </Button>
      </div>
    </div>
  );
}
