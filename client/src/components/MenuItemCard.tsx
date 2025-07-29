import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import type { Menu } from "@shared/schema";

interface MenuItemCardProps {
  menuItem: Menu;
  compact?: boolean;
}

export default function MenuItemCard({ menuItem, compact = false }: MenuItemCardProps) {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    // TODO: Implement add to cart functionality
    console.log("Add to cart:", menuItem.itemName);
  };

  if (compact) {
    return (
      <div className="flex-shrink-0 w-64">
        <Card className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
          <div className="aspect-video relative overflow-hidden">
            {menuItem.imageUrl ? (
              <img
                src={menuItem.imageUrl}
                alt={menuItem.itemName}
                className="w-full h-32 object-cover"
              />
            ) : (
              <div className="w-full h-32 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                <span className="text-orange-600 text-lg font-medium">
                  {menuItem.itemName.charAt(0)}
                </span>
              </div>
            )}
          </div>
          
          <CardContent className="p-3">
            <h4 className="font-semibold mb-1 truncate">{menuItem.itemName}</h4>
            {menuItem.description && (
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                {menuItem.description}
              </p>
            )}
            <div className="flex justify-between items-center">
              <span className="font-semibold text-tourderwang-primary">
                {menuItem.price} บาท
              </span>
              <Button
                size="sm"
                className="tourderwang-primary text-white hover:bg-orange-600 rounded-full w-8 h-8 p-0"
                onClick={handleAddToCart}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative overflow-hidden">
        {menuItem.imageUrl ? (
          <img
            src={menuItem.imageUrl}
            alt={menuItem.itemName}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
            <span className="text-orange-600 text-2xl font-medium">
              {menuItem.itemName.charAt(0)}
            </span>
          </div>
        )}
        {!menuItem.isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Badge variant="destructive">หมด</Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-lg">{menuItem.itemName}</h4>
          <Badge variant="outline" className="text-xs">
            {menuItem.category}
          </Badge>
        </div>
        
        {menuItem.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {menuItem.description}
          </p>
        )}
        
        <div className="flex justify-between items-center">
          <span className="font-semibold text-lg text-tourderwang-primary">
            {menuItem.price} บาท
          </span>
          <Button
            className="tourderwang-primary text-white hover:bg-orange-600"
            onClick={handleAddToCart}
            disabled={!menuItem.isAvailable}
          >
            <Plus className="h-4 w-4 mr-2" />
            เพิ่มลงตะกร้า
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
