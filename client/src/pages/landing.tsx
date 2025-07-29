import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import logoPath from "@assets/logo_1753786889875.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center p-4 font-thai">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center space-x-4">
              <img src={logoPath} alt="Tourderwang Logo" className="h-16 w-16" />
              <div>
                <h1 className="text-2xl font-bold text-tourderwang-primary">Tourderwang</h1>
                <p className="text-sm text-gray-600">วังสามหมอ, อุดรธานี</p>
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">
                อร่อยใส่ใจ ส่งถึงบ้าน
              </h2>
              <p className="text-gray-600">
                บริการส่งอาหารในวังสามหมอ อุดรธานี
              </p>
            </div>
            
            <div className="w-full space-y-3">
              <Button 
                className="w-full tourderwang-primary text-white hover:bg-orange-600 font-medium"
                onClick={() => window.location.href = "/api/login"}
              >
                เข้าสู่ระบบ
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  ยินดีต้อนรับสู่ Tourderwang
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
