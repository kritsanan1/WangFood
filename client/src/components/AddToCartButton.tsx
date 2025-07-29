import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ShoppingCart, Check } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface AddToCartButtonProps {
  menuId: string;
  itemName: string;
  price: number;
  className?: string;
}

export default function AddToCartButton({ menuId, itemName, price, className = "" }: AddToCartButtonProps) {
  const [isAdded, setIsAdded] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/cart/add', 'POST', {
        menuId,
        quantity: 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      setIsAdded(true);
      toast({
        title: "เพิ่มเมนูแล้ว! 🛒",
        description: `${itemName} ถูกเพิ่มลงในตะกร้าแล้ว`,
      });
      
      // Reset the "added" state after 2 seconds
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);
    },
    onError: (error: any) => {
      if (error.message.includes('401')) {
        toast({
          title: "กรุณาเข้าสู่ระบบ",
          description: "คุณต้องเข้าสู่ระบบก่อนสั่งอาหาร",
          variant: "destructive",
        });
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถเพิ่มเมนูลงตะกร้าได้",
          variant: "destructive",
        });
      }
    },
  });

  if (!isAuthenticated) {
    return (
      <Button 
        onClick={() => window.location.href = "/api/login"}
        className={`bg-gray-400 hover:bg-gray-500 text-white ${className}`}
        size="sm"
      >
        <ShoppingCart className="w-4 h-4 mr-1" />
        เข้าสู่ระบบเพื่อสั่ง
      </Button>
    );
  }

  return (
    <Button
      onClick={() => addToCartMutation.mutate()}
      disabled={addToCartMutation.isPending || isAdded}
      className={`${
        isAdded 
          ? "bg-green-500 hover:bg-green-600" 
          : "bg-[#FF6B35] hover:bg-[#E55A2B]"
      } text-white transition-all duration-200 ${className}`}
      size="sm"
    >
      {addToCartMutation.isPending ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
          กำลังเพิ่ม...
        </>
      ) : isAdded ? (
        <>
          <Check className="w-4 h-4 mr-1" />
          เพิ่มแล้ว
        </>
      ) : (
        <>
          <Plus className="w-4 h-4 mr-1" />
          ฿{price}
        </>
      )}
    </Button>
  );
}