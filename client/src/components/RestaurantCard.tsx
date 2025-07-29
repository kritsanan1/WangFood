import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Bike } from "lucide-react";
import type { Restaurant } from "@shared/schema";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link href={`/restaurant/${restaurant.id}`}>
      <Card className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="aspect-video relative overflow-hidden">
          {restaurant.imageUrl ? (
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
              <span className="text-orange-600 text-lg font-medium">
                {restaurant.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
        
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-lg truncate">{restaurant.name}</h4>
            <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm text-gray-600">{restaurant.rating}</span>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-2 truncate">
            {restaurant.description}
          </p>
          
          <div className="flex items-center space-x-2 mb-3">
            <Badge variant="secondary" className="text-xs">
              {restaurant.cuisineType}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{restaurant.deliveryTime}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Bike className="h-4 w-4" />
                <span>
                  {restaurant.deliveryFee === 0 ? "ฟรี" : `${restaurant.deliveryFee} บาท`}
                </span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
