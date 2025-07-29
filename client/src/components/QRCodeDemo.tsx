import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, Smartphone, CreditCard, Truck, Store } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export default function QRCodeDemo() {
  const [selectedDemo, setSelectedDemo] = useState<string>('table');

  // Demo QR codes for different purposes
  // Demo QR codes - using static data for demo purposes
  const tableQRData = 'https://tourderwang.com/restaurant/demo/table/1';
  const trackingQRData = 'https://tourderwang.com/track-order/demo-123';

  const demoQRCodes = {
    table: {
      title: 'Table QR Code',
      description: 'Scan to view restaurant menu and place orders',
      icon: <Store className="h-5 w-5" />,
      color: 'bg-blue-50 border-blue-200',
      data: tableQRData
    },
    tracking: {
      title: 'Order Tracking QR',
      description: 'Scan to track your delivery in real-time',
      icon: <Truck className="h-5 w-5" />,
      color: 'bg-green-50 border-green-200',
      data: trackingQRData
    },
    payment: {
      title: 'Payment QR Code',
      description: 'Quick payment with PromptPay or mobile banking',
      icon: <CreditCard className="h-5 w-5" />,
      color: 'bg-orange-50 border-orange-200',
      data: 'https://tourderwang.com/payment/demo-order'
    },
    menu: {
      title: 'Menu QR Code',
      description: 'Direct link to specific menu items',
      icon: <QrCode className="h-5 w-5" />,
      color: 'bg-purple-50 border-purple-200',
      data: 'https://tourderwang.com/restaurant/demo/menu/pad-thai'
    }
  };

  const selectedQR = demoQRCodes[selectedDemo as keyof typeof demoQRCodes];

  return (
    <Card className="border-orange-200 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-xl">
          <QrCode className="h-6 w-6 text-orange-600" />
          QR Code Features
        </CardTitle>
        <p className="text-gray-600">
          Advanced QR code integration for seamless dining experience
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedDemo} onValueChange={setSelectedDemo} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="table" className="text-xs">Table</TabsTrigger>
            <TabsTrigger value="tracking" className="text-xs">Tracking</TabsTrigger>
            <TabsTrigger value="payment" className="text-xs">Payment</TabsTrigger>
            <TabsTrigger value="menu" className="text-xs">Menu</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <Card className={`${selectedQR.color} border-2`}>
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="flex items-center gap-2">
                    {selectedQR.icon}
                    <h3 className="font-semibold text-lg">{selectedQR.title}</h3>
                  </div>
                  
                  <p className="text-sm text-gray-600 text-center">
                    {selectedQR.description}
                  </p>

                  <div className="bg-white p-4 rounded-lg border-2 border-orange-200 shadow-sm">
                    <QRCodeSVG 
                      value={selectedQR.data} 
                      size={200}
                      bgColor="#FFFFFF"
                      fgColor="#FF6B35"
                      level="M"
                      includeMargin={true}
                    />
                  </div>

                  <div className="text-center space-y-2">
                    <Badge variant="secondary" className="px-3 py-1">
                      <Smartphone className="h-3 w-3 mr-1" />
                      Scan with any QR reader
                    </Badge>
                    
                    <div className="text-xs text-gray-500 max-w-[200px] break-all">
                      {selectedQR.data}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <TabsContent value="table" className="m-0">
                <div className="space-y-2">
                  <h4 className="font-medium">Table QR Features:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Direct menu access</li>
                    <li>• Table-specific ordering</li>
                    <li>• No app download required</li>
                    <li>• Contactless dining</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="tracking" className="m-0">
                <div className="space-y-2">
                  <h4 className="font-medium">Order Tracking:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Real-time delivery updates</li>
                    <li>• Driver location sharing</li>
                    <li>• Estimated arrival time</li>
                    <li>• Order status notifications</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="payment" className="m-0">
                <div className="space-y-2">
                  <h4 className="font-medium">Payment Options:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• PromptPay integration</li>
                    <li>• Mobile banking support</li>
                    <li>• Stripe card payments</li>
                    <li>• TrueWallet compatibility</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="menu" className="m-0">
                <div className="space-y-2">
                  <h4 className="font-medium">Menu Features:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Direct dish ordering</li>
                    <li>• Ingredient information</li>
                    <li>• Customization options</li>
                    <li>• Nutritional details</li>
                  </ul>
                </div>
              </TabsContent>
            </div>
          </div>
        </Tabs>

        <div className="mt-6 pt-4 border-t">
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              <QrCode className="h-3 w-3 mr-1" />
              QR Technology
            </Badge>
            <Badge variant="outline" className="text-green-600 border-green-200">
              <Smartphone className="h-3 w-3 mr-1" />
              Mobile Optimized
            </Badge>
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              <CreditCard className="h-3 w-3 mr-1" />
              Payment Ready
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}