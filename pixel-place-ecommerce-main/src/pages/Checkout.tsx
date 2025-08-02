import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { orderService } from '@/lib/orderService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, CreditCard, MapPin, AlertCircle, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ShippingForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  notes: string;
}

interface PaymentForm {
  method: 'card' | 'cash';
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useAppContext();
  const { user } = useAuth();
  
  const [shippingForm, setShippingForm] = useState<ShippingForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Sri Lanka',
    notes: ''
  });

  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    method: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // Pre-fill form with user data if authenticated
  useEffect(() => {
    if (user) {
      setShippingForm(prev => ({
        ...prev,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postal_code || '',
        country: user.country || 'Sri Lanka'
      }));
    }
  }, [user]);

  // Check if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/');
      return;
    }

    // Require authentication for checkout
    if (!user) {
      navigate('/login');
      return;
    }
  }, [cart.length, navigate, user]);

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = subtotal * 0.15; // 15% tax
  const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const total = subtotal + tax + shipping;

  const handleShippingChange = (field: keyof ShippingForm, value: string) => {
    setShippingForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentChange = (field: keyof PaymentForm, value: string) => {
    setPaymentForm(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const requiredShippingFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'postalCode'];
    
    for (const field of requiredShippingFields) {
      if (!shippingForm[field as keyof ShippingForm]) {
        toast({
          title: "Validation Error",
          description: `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
          variant: "destructive",
        });
        return false;
      }
    }

    if (paymentForm.method === 'card') {
      const requiredPaymentFields = ['cardNumber', 'expiryDate', 'cvv', 'cardholderName'];
      for (const field of requiredPaymentFields) {
        if (!paymentForm[field as keyof PaymentForm]) {
          toast({
            title: "Validation Error",
            description: `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
            variant: "destructive",
          });
          return false;
        }
      }

      // Basic card number validation (should be 16 digits)
      if (paymentForm.cardNumber.replace(/\s/g, '').length !== 16) {
        toast({
          title: "Validation Error",
          description: "Please enter a valid 16-digit card number",
          variant: "destructive",
        });
        return false;
      }

      // Basic expiry date validation (MM/YY format)
      if (!/^\d{2}\/\d{2}$/.test(paymentForm.expiryDate)) {
        toast({
          title: "Validation Error",
          description: "Please enter expiry date in MM/YY format",
          variant: "destructive",
        });
        return false;
      }

      // Basic CVV validation (3 digits)
      if (!/^\d{3}$/.test(paymentForm.cvv)) {
        toast({
          title: "Validation Error",
          description: "Please enter a valid 3-digit CVV",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    // Require authentication for order placement
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to place an order",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      const customerInfo = {
        firstName: shippingForm.firstName,
        lastName: shippingForm.lastName,
        email: shippingForm.email,
        phone: shippingForm.phone,
        address: shippingForm.address,
        city: shippingForm.city,
        state: shippingForm.state,
        postalCode: shippingForm.postalCode,
        country: shippingForm.country
      };

      const paymentMethod = paymentForm.method === 'card' 
        ? `Credit Card ending in ${paymentForm.cardNumber.slice(-4)}`
        : 'Cash on Delivery';

      // Create order - works for both authenticated and guest users
      const order = await orderService.createOrder(
        cart,
        customerInfo,
        paymentMethod,
        user // This can be null for guest users
      );

      // Clear cart
      clearCart();

      toast({
        title: "Order Placed Successfully!",
        description: `Your order ${order.orderNumber} has been placed and will be processed shortly.`,
      });

      // Navigate to home page after successful order
      navigate('/');

    } catch (error) {
      console.error('Order placement error:', error);
      toast({
        title: "Order Failed",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Remove authentication requirement - proceed directly to checkout

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Checkout</h1>
            <p className="text-muted-foreground">Complete your purchase</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Forms */}
            <div className="space-y-6">
              {/* User Info Display */}
              {user && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Account Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      Signed in as: <strong>{user.email}</strong>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={shippingForm.firstName}
                        onChange={(e) => handleShippingChange('firstName', e.target.value)}
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={shippingForm.lastName}
                        onChange={(e) => handleShippingChange('lastName', e.target.value)}
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingForm.email}
                      onChange={(e) => handleShippingChange('email', e.target.value)}
                      placeholder="Email address"
                      disabled={!!user?.email}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={shippingForm.phone}
                      onChange={(e) => handleShippingChange('phone', e.target.value)}
                      placeholder="Phone number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={shippingForm.address}
                      onChange={(e) => handleShippingChange('address', e.target.value)}
                      placeholder="Street address"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={shippingForm.city}
                        onChange={(e) => handleShippingChange('city', e.target.value)}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State/Province *</Label>
                      <Input
                        id="state"
                        value={shippingForm.state}
                        onChange={(e) => handleShippingChange('state', e.target.value)}
                        placeholder="State or province"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="postalCode">Postal Code *</Label>
                      <Input
                        id="postalCode"
                        value={shippingForm.postalCode}
                        onChange={(e) => handleShippingChange('postalCode', e.target.value)}
                        placeholder="Postal code"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        value={shippingForm.country}
                        onChange={(e) => handleShippingChange('country', e.target.value)}
                        placeholder="Country"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                    <Input
                      id="notes"
                      value={shippingForm.notes}
                      onChange={(e) => handleShippingChange('notes', e.target.value)}
                      placeholder="Special delivery instructions"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant={paymentForm.method === 'card' ? 'default' : 'outline'}
                      onClick={() => handlePaymentChange('method', 'card')}
                      className="flex-1"
                    >
                      Credit/Debit Card
                    </Button>
                    <Button
                      type="button"
                      variant={paymentForm.method === 'cash' ? 'default' : 'outline'}
                      onClick={() => handlePaymentChange('method', 'cash')}
                      className="flex-1"
                    >
                      Cash on Delivery
                    </Button>
                  </div>

                  {paymentForm.method === 'card' && (
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="cardNumber">Card Number *</Label>
                        <Input
                          id="cardNumber"
                          value={paymentForm.cardNumber}
                          onChange={(e) => {
                            // Format card number with spaces
                            const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                            if (value.replace(/\s/g, '').length <= 16) {
                              handlePaymentChange('cardNumber', value);
                            }
                          }}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                        />
                      </div>

                      <div>
                        <Label htmlFor="cardholderName">Cardholder Name *</Label>
                        <Input
                          id="cardholderName"
                          value={paymentForm.cardholderName}
                          onChange={(e) => handlePaymentChange('cardholderName', e.target.value)}
                          placeholder="Name on card"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date *</Label>
                          <Input
                            id="expiryDate"
                            value={paymentForm.expiryDate}
                            onChange={(e) => {
                              // Format MM/YY
                              let value = e.target.value.replace(/\D/g, '');
                              if (value.length >= 2) {
                                value = value.substring(0, 2) + '/' + value.substring(2, 4);
                              }
                              handlePaymentChange('expiryDate', value);
                            }}
                            placeholder="MM/YY"
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV *</Label>
                          <Input
                            id="cvv"
                            value={paymentForm.cvv}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 3) {
                                handlePaymentChange('cvv', value);
                              }
                            }}
                            placeholder="123"
                            maxLength={3}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentForm.method === 'cash' && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        You will pay when the order is delivered to your address.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center gap-3 py-2">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity} × ${item.product.price}
                          </p>
                        </div>
                        <p className="font-medium text-sm">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax (15%)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>
                        {shipping === 0 ? (
                          <Badge variant="secondary" className="text-xs">FREE</Badge>
                        ) : (
                          `$${shipping.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="w-full mt-6"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing Order...
                      </>
                    ) : (
                      `Place Order - $${total.toFixed(2)}`
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    By placing your order, you agree to our terms and conditions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
