import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bell, MessageCircle, Share2, Users, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function SocialIntegration() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isNotifying, setIsNotifying] = useState(false);

  const handleTestNotification = async () => {
    if (!user?.lineUserId) {
      toast({
        title: "LINE Integration Required",
        description: "Please connect your LINE account to receive notifications",
        variant: "destructive",
      });
      return;
    }

    setIsNotifying(true);
    try {
      await apiRequest('POST', '/api/notify/order-update', {
        orderId: 'demo-order-123',
        status: 'preparing'
      });
      
      toast({
        title: "Test Notification Sent! 📱",
        description: "Check your LINE app for the order update message",
      });
    } catch (error: any) {
      toast({
        title: "Notification Failed",
        description: error.message || "Could not send LINE notification",
        variant: "destructive",
      });
    } finally {
      setIsNotifying(false);
    }
  };

  const socialFeatures = [
    {
      icon: <MessageCircle className="h-5 w-5" />,
      title: 'LINE Integration',
      description: 'Order notifications and customer support via LINE',
      status: user?.lineUserId ? 'connected' : 'available',
      action: user?.lineUserId ? 'Test Notification' : 'Connect LINE'
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: 'Google Account',
      description: 'Quick login and profile synchronization',
      status: user?.googleId ? 'connected' : 'available',
      action: user?.googleId ? 'Profile Synced' : 'Connect Google'
    },
    {
      icon: <Share2 className="h-5 w-5" />,
      title: 'Social Sharing',
      description: 'Share favorite restaurants and reviews',
      status: 'available',
      action: 'Share Features'
    },
    {
      icon: <Bell className="h-5 w-5" />,
      title: 'Real-time Updates',
      description: 'Live order tracking and delivery notifications',
      status: 'active',
      action: 'Always On'
    }
  ];

  return (
    <Card className="border-green-200 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-xl">
          <Users className="h-6 w-6 text-green-600" />
          Social Integration
        </CardTitle>
        <p className="text-gray-600">
          Connected dining experience with social features
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">Your Connections</h3>
          <div className="flex flex-wrap gap-2">
            {user?.email && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Replit Account
              </Badge>
            )}
            {user?.googleId && (
              <Badge className="bg-red-100 text-red-800 border-red-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Google Connected
              </Badge>
            )}
            {user?.lineUserId && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                LINE Connected
              </Badge>
            )}
            {!user?.lineUserId && !user?.googleId && (
              <Badge variant="outline" className="text-gray-600">
                Connect more services for enhanced features
              </Badge>
            )}
          </div>
        </div>

        {/* Social Features */}
        <div className="space-y-4">
          {socialFeatures.map((feature, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="text-green-600">{feature.icon}</div>
                <div>
                  <h4 className="font-medium">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={feature.status === 'connected' ? 'default' : 'secondary'}
                  className={
                    feature.status === 'connected' 
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : feature.status === 'active'
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : ''
                  }
                >
                  {feature.status}
                </Badge>
                {feature.title === 'LINE Integration' && user?.lineUserId && (
                  <Button 
                    size="sm" 
                    onClick={handleTestNotification}
                    disabled={isNotifying}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isNotifying ? 'Sending...' : 'Test'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="justify-start h-auto p-3"
              onClick={() => window.open('/api/auth/line', '_blank')}
              disabled={!!user?.lineUserId}
            >
              <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
              <div className="text-left">
                <div className="font-medium">Connect LINE</div>
                <div className="text-xs text-gray-500">Get order notifications</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start h-auto p-3"
              onClick={() => window.open('/api/auth/google', '_blank')}
              disabled={!!user?.googleId}
            >
              <Users className="h-4 w-4 mr-2 text-red-600" />
              <div className="text-left">
                <div className="font-medium">Connect Google</div>
                <div className="text-xs text-gray-500">Sync profile info</div>
              </div>
            </Button>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-gray-50 border rounded-lg p-4">
          <h4 className="font-medium mb-2">Notification Types</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Order Confirmation</span>
              <Badge variant="secondary" className="text-xs">LINE + App</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Preparation Updates</span>
              <Badge variant="secondary" className="text-xs">LINE + App</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Delivery Tracking</span>
              <Badge variant="secondary" className="text-xs">LINE + App</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Promotions</span>
              <Badge variant="secondary" className="text-xs">Optional</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}