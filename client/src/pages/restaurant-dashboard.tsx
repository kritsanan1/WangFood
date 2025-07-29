import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, 
  CheckCircle, 
  ChefHat, 
  Package,
  Truck,
  TrendingUp,
  DollarSign,
  Users,
  Settings,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Order, OrderItem } from "@shared/schema";

interface OrderWithDetails extends Order {
  items: (OrderItem & { 
    menu: { 
      itemName: string; 
      imageUrl?: string; 
    } 
  })[];
  customer: {
    name: string;
    phone?: string;
  };
}

export default function RestaurantDashboard() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("orders");

  // Fetch restaurant orders
  const { data: orders = [], isLoading } = useQuery<OrderWithDetails[]>({
    queryKey: ['/api/restaurant/orders'],
    enabled: isAuthenticated
  });

  // Update order status mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      return await apiRequest(`/api/orders/${orderId}/status`, 'PUT', { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/restaurant/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "อัปเดตสถานะแล้ว",
        description: "สถานะออเดอร์ได้รับการอัปเดตเรียบร้อย",
      });
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตสถานะออเดอร์ได้",
        variant: "destructive",
      });
    },
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          label: 'รอยืนยัน', 
          color: 'bg-yellow-500', 
          icon: Clock,
          nextStatus: 'confirmed',
          nextLabel: 'ยืนยัน'
        };
      case 'confirmed':
        return { 
          label: 'ยืนยันแล้ว', 
          color: 'bg-blue-500', 
          icon: CheckCircle,
          nextStatus: 'preparing',
          nextLabel: 'เริ่มทำ'
        };
      case 'preparing':
        return { 
          label: 'กำลังเตรียม', 
          color: 'bg-orange-500', 
          icon: ChefHat,
          nextStatus: 'ready',
          nextLabel: 'พร้อม'
        };
      case 'ready':
        return { 
          label: 'พร้อมส่ง', 
          color: 'bg-purple-500', 
          icon: Package,
          nextStatus: 'delivering',
          nextLabel: 'ส่งแล้ว'
        };
      case 'delivering':
        return { 
          label: 'กำลังส่ง', 
          color: 'bg-indigo-500', 
          icon: Truck,
          nextStatus: 'delivered',
          nextLabel: 'ส่งเสร็จ'
        };
      case 'delivered':
        return { 
          label: 'ส่งแล้ว', 
          color: 'bg-green-500', 
          icon: CheckCircle,
          nextStatus: null,
          nextLabel: null
        };
      case 'cancelled':
        return { 
          label: 'ยกเลิก', 
          color: 'bg-red-500', 
          icon: Clock,
          nextStatus: null,
          nextLabel: null
        };
      default:
        return { 
          label: 'ไม่ทราบสถานะ', 
          color: 'bg-gray-500', 
          icon: Clock,
          nextStatus: null,
          nextLabel: null
        };
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingOrders = orders.filter(order => ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status));
  const todayRevenue = orders
    .filter(order => {
      const today = new Date().toDateString();
      const orderDate = new Date(order.createdAt).toDateString();
      return orderDate === today && order.status === 'delivered';
    })
    .reduce((sum, order) => sum + order.totalAmount, 0);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-tourderwang-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
              <Settings className="w-8 h-8 text-orange-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">เข้าสู่ระบบเพื่อจัดการร้าน</h2>
            <p className="text-gray-600 mb-6">กรุณาเข้าสู่ระบบเพื่อเข้าใช้แดชบอร์ดร้านอาหาร</p>
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
                onClick={() => window.location.href = "/"}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ดร้านอาหาร</h1>
                <p className="text-gray-600">จัดการออเดอร์และติดตามยอดขาย</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ออเดอร์รอดำเนินการ</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingOrders.length}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ออเดอร์ทั้งหมดวันนี้</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orders.filter(order => {
                      const today = new Date().toDateString();
                      const orderDate = new Date(order.createdAt).toDateString();
                      return orderDate === today;
                    }).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">รายได้วันนี้</p>
                  <p className="text-2xl font-bold text-gray-900">฿{todayRevenue.toFixed(0)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ลูกค้าใหม่</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(orders.map(order => order.userId)).size}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Management */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orders">จัดการออเดอร์</TabsTrigger>
            <TabsTrigger value="analytics">รายงาน</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
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
                <p className="text-gray-600">เมื่อมีลูกค้าสั่งอาหาร ออเดอร์จะแสดงที่นี่</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <Card key={order.id} className="overflow-hidden">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              ออเดอร์ #{order.id.slice(-8).toUpperCase()}
                            </CardTitle>
                            <p className="text-sm text-gray-600">
                              {formatDateTime(order.createdAt)} • ฿{order.totalAmount.toFixed(0)}
                            </p>
                          </div>
                          <Badge className={`${statusInfo.color} text-white px-3 py-1`}>
                            <StatusIcon className="w-4 h-4 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Order Items */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">รายการอาหาร</h4>
                          <div className="space-y-2">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">{item.menu.itemName}</span>
                                  <span className="text-gray-600">x{item.quantity}</span>
                                </div>
                                <span className="font-medium">฿{(item.price * item.quantity).toFixed(0)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        {/* Customer Info & Actions */}
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">ส่งที่:</p>
                            <p className="text-gray-600">{order.deliveryAddress}</p>
                          </div>
                          
                          <div className="flex space-x-2">
                            {statusInfo.nextStatus && statusInfo.nextLabel && (
                              <Button
                                onClick={() => updateOrderMutation.mutate({
                                  orderId: order.id,
                                  status: statusInfo.nextStatus!
                                })}
                                disabled={updateOrderMutation.isPending}
                                className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white"
                              >
                                {statusInfo.nextLabel}
                              </Button>
                            )}
                            {order.status === 'pending' && (
                              <Button
                                variant="outline"
                                onClick={() => updateOrderMutation.mutate({
                                  orderId: order.id,
                                  status: 'cancelled'
                                })}
                                disabled={updateOrderMutation.isPending}
                                className="text-red-600 border-red-300 hover:bg-red-50"
                              >
                                ยกเลิก
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">รายงานการขาย</h2>
              <p className="text-gray-600 mb-6">ฟีเจอร์นี้จะเปิดใช้งานเร็วๆ นี้</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}