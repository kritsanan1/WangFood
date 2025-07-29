import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingBag, TrendingUp, Star, Plus, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertMenuSchema } from "@shared/schema";
import type { Order, Menu } from "@shared/schema";
import { z } from "zod";

const menuFormSchema = insertMenuSchema.extend({
  price: z.number().min(1, "ราคาต้องมากกว่า 0"),
});

type MenuFormData = z.infer<typeof menuFormSchema>;

export default function RestaurantDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);

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

  const { data: orders, isLoading: ordersLoading, error: ordersError } = useQuery<Order[]>({
    queryKey: ["/api/restaurant/orders"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: restaurants } = useQuery({
    queryKey: ["/api/restaurants"],
    enabled: isAuthenticated,
  });

  const { data: menus, isLoading: menusLoading } = useQuery<Menu[]>({
    queryKey: ["/api/restaurants", restaurants?.[0]?.id, "menus"],
    enabled: !!restaurants?.[0]?.id,
  });

  const form = useForm<MenuFormData>({
    resolver: zodResolver(menuFormSchema),
    defaultValues: {
      itemName: "",
      description: "",
      price: 0,
      category: "อาหารไทย",
      imageUrl: "",
      isAvailable: true,
    },
  });

  const createMenuMutation = useMutation({
    mutationFn: async (data: MenuFormData) => {
      if (!restaurants?.[0]?.id) throw new Error("No restaurant found");
      await apiRequest("POST", `/api/restaurants/${restaurants[0].id}/menus`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", restaurants?.[0]?.id, "menus"] });
      setIsMenuDialogOpen(false);
      form.reset();
      toast({
        title: "สำเร็จ",
        description: "เพิ่มเมนูใหม่เรียบร้อยแล้ว",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มเมนูได้",
        variant: "destructive",
      });
    },
  });

  const updateMenuMutation = useMutation({
    mutationFn: async (data: MenuFormData) => {
      if (!editingMenu) throw new Error("No menu to update");
      await apiRequest("PUT", `/api/menus/${editingMenu.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", restaurants?.[0]?.id, "menus"] });
      setIsMenuDialogOpen(false);
      setEditingMenu(null);
      form.reset();
      toast({
        title: "สำเร็จ",
        description: "แก้ไขเมนูเรียบร้อยแล้ว",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถแก้ไขเมนูได้",
        variant: "destructive",
      });
    },
  });

  const deleteMenuMutation = useMutation({
    mutationFn: async (menuId: string) => {
      await apiRequest("DELETE", `/api/menus/${menuId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", restaurants?.[0]?.id, "menus"] });
      toast({
        title: "สำเร็จ",
        description: "ลบเมนูเรียบร้อยแล้ว",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบเมนูได้",
        variant: "destructive",
      });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      await apiRequest("PUT", `/api/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurant/orders"] });
      toast({
        title: "สำเร็จ",
        description: "อัปเดตสถานะออเดอร์เรียบร้อยแล้ว",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตสถานะได้",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (ordersError && isUnauthorizedError(ordersError as Error)) {
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
  }, [ordersError, toast]);

  const onSubmit = (data: MenuFormData) => {
    if (editingMenu) {
      updateMenuMutation.mutate(data);
    } else {
      createMenuMutation.mutate(data);
    }
  };

  const handleEditMenu = (menu: Menu) => {
    setEditingMenu(menu);
    form.reset({
      itemName: menu.itemName,
      description: menu.description || "",
      price: menu.price,
      category: menu.category || "อาหารไทย",
      imageUrl: menu.imageUrl || "",
      isAvailable: menu.isAvailable,
    });
    setIsMenuDialogOpen(true);
  };

  const handleDeleteMenu = (menuId: string) => {
    if (confirm("คุณแน่ใจหรือไม่ที่จะลบเมนูนี้?")) {
      deleteMenuMutation.mutate(menuId);
    }
  };

  const todayOrders = orders?.filter(order => {
    const today = new Date();
    const orderDate = new Date(order.createdAt);
    return orderDate.toDateString() === today.toDateString();
  }) || [];

  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-tourderwang-background font-thai">
        <Navbar onCartClick={() => {}} />
        <div className="animate-pulse max-w-7xl mx-auto px-4 py-8">
          <div className="h-8 bg-gray-300 rounded mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-300 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tourderwang-background font-thai">
      <Navbar onCartClick={() => {}} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ดร้านอาหาร</h1>
          <p className="text-gray-600">จัดการเมนูและออเดอร์ของร้าน</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShoppingBag className="h-8 w-8 text-tourderwang-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">ออเดอร์วันนี้</p>
                  <p className="text-2xl font-semibold text-gray-900">{todayOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-tourderwang-secondary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">ยอดขายวันนี้</p>
                  <p className="text-2xl font-semibold text-gray-900">{todayRevenue.toLocaleString()} บาท</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">คะแนนเฉลี่ย</p>
                  <p className="text-2xl font-semibold text-gray-900">{restaurants?.[0]?.rating || "0.0"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* New Orders */}
          <Card>
            <CardHeader>
              <CardTitle>ออเดอร์ใหม่</CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {orders?.filter(order => order.status === "pending").slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium">#{order.id.slice(-8)}</p>
                        <p className="text-sm text-gray-600">{order.totalAmount} บาท</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleTimeString('th-TH')}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className="mb-2">{order.status}</Badge>
                        <Button
                          size="sm"
                          className="tourderwang-secondary text-white hover:bg-green-600"
                          onClick={() => updateOrderStatusMutation.mutate({ orderId: order.id, status: "confirmed" })}
                          disabled={updateOrderStatusMutation.isPending}
                        >
                          รับออเดอร์
                        </Button>
                      </div>
                    </div>
                  ))}
                  {orders?.filter(order => order.status === "pending").length === 0 && (
                    <p className="text-center text-gray-500 py-8">ไม่มีออเดอร์ใหม่</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Menu Management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>จัดการเมนู</CardTitle>
              <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="tourderwang-primary text-white hover:bg-orange-600"
                    onClick={() => {
                      setEditingMenu(null);
                      form.reset();
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    เพิ่มเมนูใหม่
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingMenu ? "แก้ไขเมนู" : "เพิ่มเมนูใหม่"}</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="itemName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ชื่อเมนู</FormLabel>
                            <FormControl>
                              <Input placeholder="ชื่อเมนู" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>รายละเอียด</FormLabel>
                            <FormControl>
                              <Textarea placeholder="รายละเอียดเมนู" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ราคา (บาท)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>หมวดหมู่</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="เลือกหมวดหมู่" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="อาหารไทย">อาหารไทย</SelectItem>
                                <SelectItem value="เครื่องดื่ม">เครื่องดื่ม</SelectItem>
                                <SelectItem value="ของหวาน">ของหวาน</SelectItem>
                                <SelectItem value="อาหารฝรั่ง">อาหารฝรั่ง</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>รูปภาพ (URL)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsMenuDialogOpen(false)}
                        >
                          ยกเลิก
                        </Button>
                        <Button 
                          type="submit"
                          className="tourderwang-primary text-white hover:bg-orange-600"
                          disabled={createMenuMutation.isPending || updateMenuMutation.isPending}
                        >
                          {editingMenu ? "บันทึก" : "เพิ่มเมนู"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {menusLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {menus?.slice(0, 10).map((menu) => (
                    <div key={menu.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium">{menu.itemName}</p>
                        <p className="text-sm text-tourderwang-primary">{menu.price} บาท</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditMenu(menu)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteMenu(menu.id)}
                          disabled={deleteMenuMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {menus?.length === 0 && (
                    <p className="text-center text-gray-500 py-8">ยังไม่มีเมนู</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
