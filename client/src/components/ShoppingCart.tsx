import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X, Plus, Minus, ShoppingBag, MapPin, Clock, CreditCard, Trash2, ShoppingCart as CartIcon } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Menu, CartItem } from "@shared/schema";

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
}

type CartItemWithMenu = CartItem & { 
  menu: Menu & { restaurant: { name: string; id: string } } 
};

export default function ShoppingCart({ isOpen, onClose }: ShoppingCartProps) {
  const [currentStep, setCurrentStep] = useState<'cart' | 'checkout'>('cart');
  const [checkoutData, setCheckoutData] = useState({
    deliveryAddress: '',
    paymentMethod: 'cod',
    specialInstructions: ''
  });
  
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch cart items
  const { data: cartItems = [], isLoading } = useQuery<CartItemWithMenu[]>({
    queryKey: ['/api/cart'],
    enabled: isAuthenticated && isOpen
  });

  // Update cart item mutation
  const updateCartMutation = useMutation({
    mutationFn: async ({ id, quantity, specialInstructions }: { id: string; quantity: number; specialInstructions?: string }) => {
      return await apiRequest(`/api/cart/${id}`, 'PUT', { quantity, specialInstructions });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update cart item",
        variant: "destructive",
      });
    },
  });

  // Remove cart item mutation
  const removeCartMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/cart/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Item removed",
        description: "Item removed from cart",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    },
  });

  // Place order mutation
  const placeOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return await apiRequest('/api/orders', 'POST', orderData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Order placed successfully! 🎉",
        description: "Your order has been placed and will be prepared soon.",
      });
      onClose();
      setCurrentStep('cart');
      setCheckoutData({
        deliveryAddress: '',
        paymentMethod: 'cod',
        specialInstructions: ''
      });
    },
    onError: () => {
      toast({
        title: "Order failed",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const total = cartItems.reduce((sum, item) => sum + (item.menu.price * item.quantity), 0);
  const deliveryFee = total > 200 ? 0 : 30; // Free delivery over 200 THB
  const grandTotal = total + deliveryFee;

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeCartMutation.mutate(id);
    } else {
      updateCartMutation.mutate({ id, quantity });
    }
  };

  const handleRemoveItem = (id: string) => {
    removeCartMutation.mutate(id);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    setCurrentStep('checkout');
  };

  const handlePlaceOrder = () => {
    if (!checkoutData.deliveryAddress.trim()) {
      toast({
        title: "Missing delivery address",
        description: "Please enter your delivery address",
        variant: "destructive",
      });
      return;
    }

    // Group items by restaurant for multiple orders if needed
    const restaurantGroups = cartItems.reduce((groups, item) => {
      const restaurantId = item.menu.restaurant.id;
      if (!groups[restaurantId]) {
        groups[restaurantId] = {
          restaurant: item.menu.restaurant,
          items: []
        };
      }
      groups[restaurantId].items.push(item);
      return groups;
    }, {} as Record<string, { restaurant: any; items: CartItemWithMenu[] }>);

    // For now, create one order (assuming single restaurant)
    const firstRestaurant = Object.values(restaurantGroups)[0];
    
    const orderData = {
      restaurantId: firstRestaurant.restaurant.id,
      totalAmount: grandTotal,
      deliveryAddress: checkoutData.deliveryAddress,
      paymentMethod: checkoutData.paymentMethod,
      specialInstructions: checkoutData.specialInstructions,
      items: firstRestaurant.items.map(item => ({
        menuId: item.menuId,
        quantity: item.quantity,
        price: item.menu.price,
        specialInstructions: item.specialInstructions
      }))
    };

    placeOrderMutation.mutate(orderData);
  };

  const renderCartStep = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CartIcon className="w-5 h-5 text-[#FF6B35]" />
          <h2 className="text-lg font-semibold">ตะกร้าสินค้า ({cartItems.length})</h2>
        </div>
        <Badge variant="secondary" className="bg-[#2ECC71] text-white">
          {total > 200 ? "ฟรีค่าส่ง!" : `อีก ฿${200 - total} ฟรีค่าส่ง`}
        </Badge>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B35]"></div>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-2">ตะกร้าของคุณว่างเปล่า</p>
          <p className="text-sm text-gray-400">เพิ่มอาหารที่คุณชื่นชอบใส่ตะกร้า</p>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="border-l-4 border-l-[#FF6B35]">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <img
                      src={item.menu.imageUrl || '/placeholder-food.jpg'}
                      alt={item.menu.itemName}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {item.menu.itemName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.menu.restaurant.name}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={updateCartMutation.isPending}
                            className="w-8 h-8 p-0"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={updateCartMutation.isPending}
                            className="w-8 h-8 p-0"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-[#FF6B35]">
                            ฿{(item.menu.price * item.quantity).toFixed(0)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={removeCartMutation.isPending}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {item.specialInstructions && (
                        <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                          หมายเหตุ: {item.specialInstructions}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          {/* Order Summary */}
          <Card className="bg-gradient-to-r from-orange-50 to-green-50">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>ยอดรวมอาหาร</span>
                  <span>฿{total.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>ค่าจัดส่ง</span>
                  <span className={deliveryFee === 0 ? "text-green-600 font-medium" : ""}>
                    {deliveryFee === 0 ? "ฟรี!" : `฿${deliveryFee}`}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>ยอดรวมทั้งหมด</span>
                  <span className="text-[#FF6B35]">฿{grandTotal.toFixed(0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Button */}
          <Button
            onClick={handleCheckout}
            className="w-full bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-semibold py-3 rounded-xl"
            size="lg"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            ดำเนินการสั่งซื้อ
          </Button>
        </>
      )}
    </div>
  );

  const renderCheckoutStep = () => (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => setCurrentStep('cart')}
          className="p-2"
        >
          <X className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-semibold">ข้อมูลการสั่งซื้อ</h2>
      </div>

      {/* Order Summary */}
      <Card className="bg-gradient-to-r from-orange-50 to-green-50">
        <CardHeader className="pb-3">
          <h3 className="font-medium">สรุปคำสั่งซื้อ</h3>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>รายการ ({cartItems.length} ชิ้น)</span>
              <span>฿{total.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span>ค่าจัดส่ง</span>
              <span className={deliveryFee === 0 ? "text-green-600 font-medium" : ""}>
                {deliveryFee === 0 ? "ฟรี!" : `฿${deliveryFee}`}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>ยอดรวมทั้งหมด</span>
              <span className="text-[#FF6B35]">฿{grandTotal.toFixed(0)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Address */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-[#FF6B35]" />
            <h3 className="font-medium">ที่อยู่จัดส่ง</h3>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Textarea
            placeholder="กรุณาระบุที่อยู่สำหรับจัดส่ง..."
            value={checkoutData.deliveryAddress}
            onChange={(e) => setCheckoutData(prev => ({ ...prev, deliveryAddress: e.target.value }))}
            className="min-h-[80px]"
          />
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-[#FF6B35]" />
            <h3 className="font-medium">วิธีการชำระเงิน</h3>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <RadioGroup
            value={checkoutData.paymentMethod}
            onValueChange={(value) => setCheckoutData(prev => ({ ...prev, paymentMethod: value }))}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cod" id="cod" />
              <Label htmlFor="cod">ชำระเงินปลายทาง (COD)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="transfer" id="transfer" />
              <Label htmlFor="transfer">โอนเงินผ่านธนาคาร</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Special Instructions */}
      <Card>
        <CardHeader className="pb-3">
          <h3 className="font-medium">หมายเหตุเพิ่มเติม</h3>
        </CardHeader>
        <CardContent className="pt-0">
          <Textarea
            placeholder="หมายเหตุสำหรับร้านค้า (ถ้ามี)..."
            value={checkoutData.specialInstructions}
            onChange={(e) => setCheckoutData(prev => ({ ...prev, specialInstructions: e.target.value }))}
            className="min-h-[60px]"
          />
        </CardContent>
      </Card>

      {/* Place Order Button */}
      <Button
        onClick={handlePlaceOrder}
        disabled={placeOrderMutation.isPending || !checkoutData.deliveryAddress.trim()}
        className="w-full bg-[#2ECC71] hover:bg-[#27AE60] text-white font-semibold py-3 rounded-xl"
        size="lg"
      >
        {placeOrderMutation.isPending ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            กำลังสั่งซื้อ...
          </>
        ) : (
          <>
            <ShoppingBag className="w-5 h-5 mr-2" />
            ยืนยันการสั่งซื้อ
          </>
        )}
      </Button>
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[500px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="sr-only">Shopping Cart</SheetTitle>
        </SheetHeader>
        
        {currentStep === 'cart' ? renderCartStep() : renderCheckoutStep()}
      </SheetContent>
    </Sheet>
  );
}