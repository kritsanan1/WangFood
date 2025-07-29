import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  MapPin, 
  Phone, 
  CheckCircle, 
  Truck, 
  ChefHat, 
  Package,
  Star,
  MessageCircle,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Order, OrderItem } from "@shared/schema";

interface OrderWithDetails extends Order {
  items: (OrderItem & { 
    menu: { 
      itemName: string; 
      imageUrl?: string; 
    } 
  })[];
  restaurant: {
    name: string;
    phone?: string;
    imageUrl?: string;
  };
}

export default function OrderTracking() {
  const { isAuthenticated } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  // Fetch user orders
  const { data: orders = [], isLoading } = useQuery<OrderWithDetails[]>({
    queryKey: ['/api/orders'],
    enabled: isAuthenticated
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          label: 'รอยืนยัน', 
          color: 'bg-yellow-500', 
          icon: Clock, 
          progress: 10,
          description: 'ร้านอาหารกำลังตรวจสอบออเดอร์ของคุณ'
        };
      case 'confirmed':
        return { 
          label: 'ยืนยันแล้ว', 
          color: 'bg-blue-500', 
          icon: CheckCircle, 
          progress: 25,
          description: 'ร้านอาหารได้รับออเดอร์และเริ่มเตรียมอาหาร'
        };
      case 'preparing':
        return { 
          label: 'กำลังเตรียม', 
          color: 'bg-orange-500', 
          icon: ChefHat, 
          progress: 50,
          description: 'เชฟจัดการเตรียมอาหารให้คุณอย่างดีที่สุด'
        };
      case 'ready':
        return { 
          label: 'พร้อมส่ง', 
          color: 'bg-purple-500', 
          icon: Package, 
          progress: 75,
          description: 'อาหารพร้อมแล้ว กำลังรอไรเดอร์มารับ'
        };
      case 'delivering':
        return { 
          label: 'กำลังส่ง', 
          color: 'bg-indigo-500', 
          icon: Truck, 
          progress: 90,
          description: 'ไรเดอร์กำลังนำอาหารมาส่งที่บ้านคุณ'
        };
      case 'delivered':
        return { 
          label: 'ส่งแล้ว', 
          color: 'bg-green-500', 
          icon: CheckCircle, 
          progress: 100,
          description: 'อาหารส่งถึงแล้ว ขอบคุณที่ใช้บริการ'
        };
      case 'cancelled':
        return { 
          label: 'ยกเลิก', 
          color: 'bg-red-500', 
          icon: Clock, 
          progress: 0,
          description: 'ออเดอร์ถูกยกเลิก'
        };
      default:
        return { 
          label: 'ไม่ทราบสถานะ', 
          color: 'bg-gray-500', 
          icon: Clock, 
          progress: 0,
          description: 'ไม่สามารถระบุสถานะได้'
        };
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-tourderwang-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">เข้าสู่ระบบเพื่อติดตามออเดอร์</h2>
            <p className="text-gray-600 mb-6">กรุณาเข้าสู่ระบบเพื่อดูสถานะการสั่งซื้อของคุณ</p>
            <Button 
              onClick={() => window.location.href = "/api/login"}
              className="w-full bg-[#FF6B35] hover:bg-[#E55A2B] text-white"
            >
              เข้าสู่ระบบ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tourderwang-background">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => window.history.back()}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ติดตามออเดอร์</h1>
                <p className="text-gray-600">ตรวจสอบสถานะการสั่งซื้อของคุณ</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">ยังไม่มีออเดอร์</h2>
            <p className="text-gray-600 mb-8">เมื่อคุณสั่งอาหาร ออเดอร์จะแสดงที่นี่</p>
            <Button
              onClick={() => window.location.href = "/"}
              className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white px-8 py-3"
            >
              เริ่มสั่งอาหาร
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <Card key={order.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={order.restaurant.imageUrl || '/placeholder-restaurant.jpg'}
                          alt={order.restaurant.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <CardTitle className="text-lg">{order.restaurant.name}</CardTitle>
                          <p className="text-sm text-gray-600">
                            ออเดอร์ #{order.id.slice(-8).toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${statusInfo.color} text-white px-3 py-1`}>
                        <StatusIcon className="w-4 h-4 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">ความคืบหน้า</span>
                        <span className="font-medium">{statusInfo.progress}%</span>
                      </div>
                      <Progress value={statusInfo.progress} className="h-2" />
                      <p className="text-sm text-gray-600">{statusInfo.description}</p>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">รายการอาหาร</h4>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between py-2">
                            <div className="flex items-center space-x-3">
                              <img
                                src={item.menu.imageUrl || '/placeholder-food.jpg'}
                                alt={item.menu.itemName}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                              <div>
                                <span className="font-medium">{item.menu.itemName}</span>
                                <span className="text-gray-600 ml-2">x{item.quantity}</span>
                              </div>
                            </div>
                            <span className="font-medium text-[#FF6B35]">
                              ฿{(item.price * item.quantity).toFixed(0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Order Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                          <Clock className="w-4 h-4" />
                          <span>สั่งเมื่อ: {formatDateTime(order.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                          <MapPin className="w-4 h-4" />
                          <span>ส่งที่: {order.deliveryAddress}</span>
                        </div>
                        {order.restaurant.phone && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>โทร: {order.restaurant.phone}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#FF6B35] mb-1">
                          ฿{order.totalAmount.toFixed(0)}
                        </div>
                        <div className="text-sm text-gray-600">
                          ชำระด้วย: {order.paymentMethod === 'cod' ? 'เงินสด' : 'โอนเงิน'}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4">
                      {order.status === 'delivered' && (
                        <Button variant="outline" className="flex-1">
                          <Star className="w-4 h-4 mr-2" />
                          ให้คะแนน
                        </Button>
                      )}
                      <Button variant="outline" className="flex-1">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        ติดต่อร้าน
                      </Button>
                      <Button 
                        className="flex-1 bg-[#FF6B35] hover:bg-[#E55A2B] text-white"
                        onClick={() => window.location.href = `/restaurant/${order.restaurantId}`}
                      >
                        สั่งซ้ำ
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}