import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Utensils, Bike, Home } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Order, OrderItem } from "@shared/schema";

const statusSteps = [
  { key: "pending", label: "ยืนยันออเดอร์แล้ว", icon: CheckCircle2 },
  { key: "confirmed", label: "กำลังเตรียมอาหาร", icon: Utensils },
  { key: "preparing", label: "กำลังจัดส่ง", icon: Bike },
  { key: "delivering", label: "ส่งถึงแล้ว", icon: Home },
];

const statusColors = {
  pending: "bg-yellow-500",
  confirmed: "bg-blue-500", 
  preparing: "bg-orange-500",
  delivering: "bg-green-500",
  delivered: "bg-green-600",
  cancelled: "bg-red-500",
};

const statusLabels = {
  pending: "รอยืนยัน",
  confirmed: "ยืนยันแล้ว",
  preparing: "กำลังเตรียม",
  delivering: "กำลังจัดส่ง",
  delivered: "ส่งถึงแล้ว",
  cancelled: "ยกเลิกแล้ว",
};

export default function OrderTracking() {
  const [, params] = useRoute("/orders/:id");
  const orderId = params?.id;
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: orderData, isLoading: orderLoading, error } = useQuery<Order & { items: OrderItem[] }>({
    queryKey: ["/api/orders", orderId],
    enabled: !!orderId && isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [error, toast]);

  if (orderLoading || isLoading) {
    return (
      <div className="min-h-screen bg-tourderwang-background font-thai">
        <Navbar onCartClick={() => {}} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-6" />
            <Card>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-300 rounded mb-4" />
                <div className="h-4 bg-gray-300 rounded mb-4 w-3/4" />
                <div className="h-4 bg-gray-300 rounded w-1/2" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-tourderwang-background font-thai">
        <Navbar onCartClick={() => {}} />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ไม่พบออเดอร์</h1>
          <p className="text-gray-600">ออเดอร์ที่คุณต้องการติดตามไม่มีอยู่ในระบบ</p>
        </div>
      </div>
    );
  }

  const currentStatusIndex = statusSteps.findIndex(step => step.key === orderData.status);

  return (
    <div className="min-h-screen bg-tourderwang-background font-thai">
      <Navbar onCartClick={() => {}} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ติดตามออเดอร์</h1>
          <p className="text-gray-600">ออเดอร์ #{orderData.id.slice(-8)}</p>
        </div>

        {/* Order Status */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium">ออเดอร์ #{orderData.id.slice(-8)}</span>
              <Badge 
                className={`${statusColors[orderData.status as keyof typeof statusColors]} text-white`}
              >
                {statusLabels[orderData.status as keyof typeof statusLabels]}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              ที่อยู่จัดส่ง: {orderData.deliveryAddress}
            </p>

            {/* Status Timeline */}
            <div className="space-y-4">
              {statusSteps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                
                return (
                  <div key={step.key} className="flex items-center space-x-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted 
                        ? "tourderwang-secondary text-white" 
                        : "bg-gray-300"
                    }`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${isCurrent ? "text-gray-900" : "text-gray-500"}`}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-sm text-gray-500">
                          {index === 0 && "รอการยืนยันจากร้าน"}
                          {index === 1 && "ประมาณ 15-25 นาที"}
                          {index === 2 && "กำลังเดินทางไปส่ง"}
                          {index === 3 && "ขอบคุณที่ใช้บริการ"}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {orderData.estimatedDeliveryTime && (
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="font-medium">เวลาส่งโดยประมาณ:</span>
                  <span className="text-tourderwang-primary font-semibold">
                    {new Date(orderData.estimatedDeliveryTime).toLocaleTimeString('th-TH', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">รายการสั่งซื้อ</h3>
            <div className="space-y-4">
              {orderData.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex-1">
                    <p className="font-medium">รายการอาหาร</p>
                    <p className="text-sm text-gray-600">จำนวน: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-tourderwang-primary">
                    {item.price * item.quantity} บาท
                  </p>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex justify-between">
                <span>ยอดรวม</span>
                <span>{orderData.totalAmount - orderData.deliveryFee} บาท</span>
              </div>
              <div className="flex justify-between">
                <span>ค่าส่ง</span>
                <span>{orderData.deliveryFee === 0 ? "ฟรี" : `${orderData.deliveryFee} บาท`}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>ราคารวม</span>
                <span className="text-tourderwang-primary">{orderData.totalAmount} บาท</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Note */}
        {orderData.customerNote && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">หมายเหตุ</h3>
              <p className="text-gray-700">{orderData.customerNote}</p>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
