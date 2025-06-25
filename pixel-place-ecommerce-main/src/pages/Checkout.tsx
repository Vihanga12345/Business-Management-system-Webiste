import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { ShoppingCart, CreditCard, Truck, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { orderService, OrderCustomerInfo } from '@/lib/orderService';

export default function Checkout() {
  const { cart, clearCart } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [customerInfo, setCustomerInfo] = useState<OrderCustomerInfo>({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: '',
    postalCode: user?.postal_code || '',
    country: 'Sri Lanka',
  });

  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + tax + shipping;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!customerInfo.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!customerInfo.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!customerInfo.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(customerInfo.email)) newErrors.email = 'Email is invalid';
    if (!customerInfo.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!customerInfo.address.trim()) newErrors.address = 'Address is required';
    if (!customerInfo.city.trim()) newErrors.city = 'City is required';
    if (!customerInfo.state.trim()) newErrors.state = 'State is required';
    if (!customerInfo.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    if (!paymentMethod) newErrors.paymentMethod = 'Payment method is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof OrderCustomerInfo, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      toast({
        title: "Please fill in all required fields",
        description: "Check the form for any errors and try again.",
        variant: "destructive",
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Your cart is empty",
        description: "Add some items to your cart before checking out.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to place an order.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create the order with user ID for database integration
      const order = await orderService.createOrder(cart, customerInfo, paymentMethod, user.id);

      // Clear the cart
      clearCart();

      // Show success message
      toast({
        title: "Order placed successfully!",
        description: `Your order ${order.orderNumber} has been placed and is being processed.`,
      });

      // Navigate to order confirmation or home
      navigate('/', { 
        state: { 
          orderConfirmation: {
            orderNumber: order.orderNumber,
            total: order.totalAmount,
            email: order.customerInfo.email,
            erpOrderNumber: order.erpOrderNumber,
            syncStatus: order.syncStatus
          }
        }
      });

    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Order placement failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">
            Add some items to your cart to proceed with checkout.
          </p>
          <Button onClick={() => navigate('/')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                      value={customerInfo.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={customerInfo.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
              </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={customerInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    value={customerInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={errors.address ? 'border-red-500' : ''}
                  />
                  {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={customerInfo.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={errors.city ? 'border-red-500' : ''}
                    />
                    {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
                </div>
                <div>
                    <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                      value={customerInfo.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                      className={errors.state ? 'border-red-500' : ''}
                  />
                    {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state}</p>}
                </div>
              </div>

                <div className="grid grid-cols-2 gap-4">
              <div>
                    <Label htmlFor="postalCode">Postal Code *</Label>
                <Input
                  id="postalCode"
                      value={customerInfo.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      className={errors.postalCode ? 'border-red-500' : ''}
                    />
                    {errors.postalCode && <p className="text-sm text-red-500 mt-1">{errors.postalCode}</p>}
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={customerInfo.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      disabled
                />
              </div>
              </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className={errors.paymentMethod ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="debit_card">Debit Card</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
                {errors.paymentMethod && <p className="text-sm text-red-500 mt-1">{errors.paymentMethod}</p>}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product.name}</h4>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              </div>
                      <p className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

                <Separator />

            {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
              </div>
                  <div className="flex justify-between">
                    <span>Tax (8%):</span>
                    <span>${tax.toFixed(2)}</span>
              </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                  {subtotal > 100 && (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      Free shipping applied!
                </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
              </div>
                </div>

                {/* ERP Integration Info */}
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your order will be automatically synced with our ERP system for processing and fulfillment.
                  </AlertDescription>
                </Alert>

                {/* Place Order Button */}
            <Button 
                  onClick={handlePlaceOrder}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Order...
                    </>
                  ) : (
                    `Place Order - $${total.toFixed(2)}`
                  )}
            </Button>

                <p className="text-xs text-gray-500 text-center">
                  By placing this order, you agree to our terms and conditions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
