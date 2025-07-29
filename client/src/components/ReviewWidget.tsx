import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertReviewSchema } from "@shared/schema";
import { z } from "zod";

const reviewFormSchema = insertReviewSchema.extend({
  rating: z.number().min(1, "กรุณาให้คะแนน").max(5, "คะแนนสูงสุด 5 ดาว"),
});

type ReviewFormData = z.infer<typeof reviewFormSchema>;

interface ReviewWidgetProps {
  restaurantId: string;
}

export default function ReviewWidget({ restaurantId }: ReviewWidgetProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const { toast } = useToast();

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      restaurantId,
      rating: 0,
      comment: "",
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      await apiRequest("POST", "/api/reviews", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", restaurantId, "reviews"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "สำเร็จ",
        description: "เพิ่มรีวิวเรียบร้อยแล้ว",
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
        description: "ไม่สามารถเพิ่มรีวิวได้",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ReviewFormData) => {
    createReviewMutation.mutate(data);
  };

  const selectedRating = form.watch("rating");

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold">แสดงความคิดเห็น</h4>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="tourderwang-primary text-white hover:bg-orange-600">
                <MessageSquare className="h-4 w-4 mr-2" />
                เขียนรีวิว
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>เขียนรีวิวร้านอาหาร</DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ให้คะแนน</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                className="focus:outline-none"
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                onClick={() => field.onChange(star)}
                              >
                                <Star
                                  className={`h-8 w-8 transition-colors ${
                                    star <= (hoveredRating || selectedRating)
                                      ? "text-yellow-500 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ความคิดเห็น</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="แชร์ประสบการณ์การใช้บริการของคุณ..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      ยกเลิก
                    </Button>
                    <Button
                      type="submit"
                      className="tourderwang-primary text-white hover:bg-orange-600"
                      disabled={createReviewMutation.isPending}
                    >
                      {createReviewMutation.isPending ? "กำลังส่ง..." : "ส่งรีวิว"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        
        <p className="text-gray-600 text-sm">
          แชร์ประสบการณ์การใช้บริการของคุณเพื่อช่วยเหลือลูกค้าคนอื่น
        </p>
      </CardContent>
    </Card>
  );
}
