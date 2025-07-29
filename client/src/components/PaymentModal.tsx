import { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CreditCard, QrCode, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { QRCodeSVG } from 'qrcode.react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
  onPaymentSuccess: () => void;
}

interface PaymentFormProps {
  orderId: string;
  amount: number;
  onSuccess: () => void;
  onClose: () => void;
}

function PaymentForm({ orderId, amount, onSuccess, onClose }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent?.status === 'succeeded') {
        // Confirm payment on backend
        await apiRequest('POST', '/api/confirm-payment', {
          paymentIntentId: paymentIntent.id,
          orderId
        });

        toast({
          title: "Payment Successful! 🎉",
          description: "Your order has been confirmed and the restaurant is preparing your food.",
        });
        
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isLoading} 
        className="w-full bg-orange-600 hover:bg-orange-700"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay ฿{amount.toFixed(2)}
          </>
        )}
      </Button>
    </form>
  );
}

function QRPaymentTab({ orderId, amount, method }: { orderId: string; amount: number; method: string }) {
  const [qrCode, setQrCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const generateQR = async () => {
      try {
        const response = await apiRequest('GET', `/api/qr/payment/${orderId}?method=${method}&amount=${amount}`);
        setQrCode(response.qrCode);
      } catch (error) {
        toast({
          title: "QR Generation Failed",
          description: "Could not generate QR code for payment",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    generateQR();
  }, [orderId, amount, method]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h4 className="text-lg font-semibold mb-2">
          {method === 'promptpay' ? 'PromptPay QR Code' : 'TrueWallet QR Code'}
        </h4>
        <p className="text-gray-600 mb-4">
          Scan this QR code with your mobile banking app
        </p>
      </div>
      
      <div className="flex justify-center">
        <div className="bg-white p-4 rounded-lg border-2 border-orange-200">
          {qrCode ? (
            <QRCodeSVG value={qrCode} size={200} />
          ) : (
            <div className="w-[200px] h-[200px] bg-gray-100 flex items-center justify-center">
              <QrCode className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      <div className="bg-orange-50 p-4 rounded-lg">
        <h5 className="font-medium mb-2">Payment Instructions:</h5>
        <ol className="text-sm text-gray-600 space-y-1">
          <li>1. Open your mobile banking app</li>
          <li>2. Select "Scan QR Code" or "PromptPay"</li>
          <li>3. Scan the QR code above</li>
          <li>4. Confirm the amount: ฿{amount.toFixed(2)}</li>
          <li>5. Complete the payment</li>
        </ol>
      </div>

      <Badge variant="secondary" className="w-full justify-center py-2">
        <Smartphone className="mr-2 h-4 w-4" />
        Amount: ฿{amount.toFixed(2)}
      </Badge>
    </div>
  );
}

export default function PaymentModal({ isOpen, onClose, orderId, amount, onPaymentSuccess }: PaymentModalProps) {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && orderId && amount) {
      const createPaymentIntent = async () => {
        try {
          const response = await apiRequest('POST', '/api/create-payment-intent', {
            amount,
            orderId,
            paymentMethod: 'stripe'
          });
          setClientSecret(response.clientSecret);
        } catch (error: any) {
          toast({
            title: "Payment Setup Failed",
            description: error.message || "Could not setup payment",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      createPaymentIntent();
    }
  }, [isOpen, orderId, amount]);

  const stripeOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#EA580C',
        colorBackground: '#FFFFFF',
        colorText: '#111827',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            Complete Your Payment
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card className="border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-center text-lg">
                Order Total: ฿{amount.toFixed(2)}
              </CardTitle>
            </CardHeader>
          </Card>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Setting up payment...</span>
            </div>
          ) : (
            <Tabs defaultValue="stripe" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="stripe">
                  <CreditCard className="h-4 w-4 mr-1" />
                  Card
                </TabsTrigger>
                <TabsTrigger value="promptpay">
                  <QrCode className="h-4 w-4 mr-1" />
                  PromptPay
                </TabsTrigger>
                <TabsTrigger value="truewallet">
                  <Smartphone className="h-4 w-4 mr-1" />
                  TrueWallet
                </TabsTrigger>
              </TabsList>

              <TabsContent value="stripe">
                {clientSecret && (
                  <Elements stripe={stripePromise} options={stripeOptions}>
                    <PaymentForm 
                      orderId={orderId}
                      amount={amount}
                      onSuccess={onPaymentSuccess}
                      onClose={onClose}
                    />
                  </Elements>
                )}
              </TabsContent>

              <TabsContent value="promptpay">
                <QRPaymentTab orderId={orderId} amount={amount} method="promptpay" />
              </TabsContent>

              <TabsContent value="truewallet">
                <QRPaymentTab orderId={orderId} amount={amount} method="truewallet" />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}