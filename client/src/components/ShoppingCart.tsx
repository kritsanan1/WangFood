import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShoppingCart({ isOpen, onClose }: ShoppingCartProps) {
  // Mock cart items - replace with actual cart state management
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "1",
      name: "ผัดไทย",
      price: 60,
      quantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1559847844-d90f0025b7b4?w=100&h=100&fit=crop",
    },
  ]);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCartItems(items => items.filter(item => item.id !== id));
    } else {
      setCartItems(items =>
        items.map(item =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 0; // Free delivery
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    // TODO: Implement checkout functionality
    console.log("Proceed to checkout");
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full max-w-md font-thai">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <ShoppingBag className="h-5 w-5" />
            <span>ตรวจสอบออเดอร์</span>
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto py-4">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">ตะกร้าของคุณว่างเปล่า</p>
                <p className="text-sm text-gray-400">เพิ่มเมนูที่คุณชอบเข้าตะกร้า</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 py-4 border-b">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                          <span className="text-orange-600 font-medium">
                            {item.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.price} บาท</p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-8 h-8 rounded-full p-0"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-medium w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        className="w-8 h-8 rounded-full p-0 tourderwang-primary text-white hover:bg-orange-600"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-red-500 p-1"
                      onClick={() => updateQuantity(item.id, 0)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {cartItems.length > 0 && (
            <div className="border-t bg-gray-50 p-4 -mx-6 -mb-6">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>ยอดรวม</span>
                  <span>{subtotal} บาท</span>
                </div>
                <div className="flex justify-between">
                  <span>ค่าส่ง</span>
                  <span className="text-tourderwang-secondary">
                    {deliveryFee === 0 ? "ฟรี" : `${deliveryFee} บาท`}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>ราคารวม</span>
                  <span className="text-tourderwang-primary">{total} บาท</span>
                </div>
              </div>
              
              <Button
                className="w-full tourderwang-primary text-white hover:bg-orange-600 font-medium"
                onClick={handleCheckout}
              >
                สั่งออเดอร์
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
