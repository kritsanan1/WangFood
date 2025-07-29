import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Phone, Clock, Star, Users, Truck, CreditCard } from 'lucide-react';
import logoImage from '@/assets/logo.png';

export default function Welcome() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    window.location.href = `/api/auth/${provider}`;
  };

  const features = [
    {
      icon: <Truck className="h-6 w-6" />,
      title: 'Fast Delivery',
      description: 'Quick delivery from local Wang Sam Mo restaurants'
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: 'Multiple Payment Options',
      description: 'Cash, Stripe, LINE Pay, and QR codes supported'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Social Login',
      description: 'Login with Google, LINE, or Replit account'
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: 'Quality Food',
      description: 'Authentic Thai cuisine from verified restaurants'
    }
  ];

  const restaurantHighlights = [
    {
      name: "ร้านอาหารไทยดั้งเดิม",
      cuisine: "อาหารไทย",
      rating: 4.8,
      deliveryTime: "20-30 นาที",
      image: "🏮"
    },
    {
      name: "ส้มตำอีสาน",
      cuisine: "อีสาน",
      rating: 4.9,
      deliveryTime: "15-25 นาที", 
      image: "🥗"
    },
    {
      name: "ก๋วยเตี๋ยวต้มยำ",
      cuisine: "ก๋วยเตี๋ยว",
      rating: 4.7,
      deliveryTime: "25-35 นาที",
      image: "🍜"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img 
              src={logoImage} 
              alt="Tourderwang Logo" 
              className="h-32 w-auto"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            ทัวร์เดอร์วาง
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-orange-600 mb-4">
            Wang Sam Mo Food Delivery
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Authentic Thai food delivery from local restaurants in Wang Sam Mo, Udonthani. 
            Fast, fresh, and delicious meals delivered to your door! 🐊
          </p>
          
          {/* Location Badge */}
          <div className="flex items-center justify-center mb-8">
            <Badge variant="secondary" className="px-4 py-2 text-lg">
              <MapPin className="h-4 w-4 mr-2" />
              Wang Sam Mo, Udonthani, Thailand
            </Badge>
          </div>
        </div>

        {/* Social Login Section */}
        <Card className="max-w-md mx-auto mb-12 shadow-lg border-orange-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-900">Get Started</CardTitle>
            <CardDescription>
              Choose your preferred login method to start ordering
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3"
              size="lg"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

            <Button 
              onClick={() => handleSocialLogin('line')}
              disabled={isLoading}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3"
              size="lg"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738S0 4.935 0 10.304c0 4.816 4.267 8.846 10.031 9.617.391.084.922.258 1.057.592.121.303.078.779.039 1.086l-.164 1.027c-.051.3-.234 1.172 1.027.641 1.262-.531 6.801-4.004 9.288-6.852C22.953 14.746 24 12.67 24 10.304z"/>
              </svg>
              Continue with LINE
            </Button>

            <Button 
              onClick={() => handleSocialLogin('')}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              size="lg"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.59 1.227c-.24-.42-.777-.42-1.017 0L.367 11.62c-.24.42.06.945.508.945h5.653c.448 0 .748-.525.508-.945L7.59 1.227zM23.633 11.62l-6.206-10.393c-.24-.42-.777-.42-1.017 0l-.546.915c-.24.42.06.945.508.945h5.653c.448 0 .748-.525.508-.945zm-6.798 5.587L10.628 6.814c-.24-.42-.777-.42-1.017 0l-6.206 10.393c-.24.42.06.945.508.945h12.412c.448 0 .748-.525.508-.945z"/>
              </svg>
              Continue with Replit
            </Button>

            <Separator className="my-4" />

            <div className="text-center">
              <Link href="/guest-browse">
                <Button variant="outline" className="w-full py-3" size="lg">
                  Browse as Guest
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Features Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">
            Why Choose Tourderwang?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-md transition-shadow border-orange-100">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4 text-orange-600">
                    {feature.icon}
                  </div>
                  <h4 className="font-semibold mb-2 text-gray-900">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Restaurant Highlights */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">
            Popular Restaurants
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {restaurantHighlights.map((restaurant, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-orange-100">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4 text-center">{restaurant.image}</div>
                  <h4 className="font-semibold text-lg mb-2 text-gray-900">{restaurant.name}</h4>
                  <p className="text-orange-600 mb-2">{restaurant.cuisine}</p>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      {restaurant.rating}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {restaurant.deliveryTime}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <Card className="max-w-md mx-auto border-orange-200">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-gray-900">Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-2">
            <div className="flex items-center justify-center text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              <span>+66 XX XXX XXXX</span>
            </div>
            <div className="flex items-center justify-center text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span>Daily: 6:00 AM - 11:00 PM</span>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Serving authentic Thai food in Wang Sam Mo, Udonthani
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}