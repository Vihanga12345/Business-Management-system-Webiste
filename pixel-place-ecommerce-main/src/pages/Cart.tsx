
import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';

const Cart = () => {
  const { cart, updateCartQuantity, removeFromCart, getCartTotal } = useApp();

  const formatPrice = (price: number) => {
    return `Rs ${price.toLocaleString()}.00`;
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <ShoppingBag className="w-24 h-24 text-gray-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">Your cart is empty</h1>
          <p className="text-gray-400 mb-8">Add some products to get started!</p>
          <Link to="/collections">
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3">
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-6 gap-4 p-4 bg-gray-700 text-white font-medium">
                <div className="col-span-2">Product</div>
                <div className="text-center">Price</div>
                <div className="text-center">Quantity</div>
                <div className="text-center">Total</div>
                <div className="text-center">Action</div>
              </div>

              {/* Cart Items */}
              {cart.map((item) => (
                <div key={item.product.id} className="grid grid-cols-6 gap-4 p-4 border-b border-gray-700 items-center">
                  {/* Product Info */}
                  <div className="col-span-2 flex items-center space-x-4">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <h3 className="text-white font-medium">{item.product.name}</h3>
                      <p className="text-gray-400 text-sm">{item.product.category}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-center text-white">
                    {formatPrice(item.product.price)}
                  </div>

                  {/* Quantity */}
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 bg-gray-700 text-white rounded hover:bg-gray-600 flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-white w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 bg-gray-700 text-white rounded hover:bg-gray-600 flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="text-center text-cyan-500 font-bold">
                    {formatPrice(item.product.price * item.quantity)}
                  </div>

                  {/* Remove */}
                  <div className="text-center">
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-400 hover:text-red-300 p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Shopping */}
            <div className="mt-6 flex justify-between items-center">
              <Link to="/collections">
                <Button variant="outline" className="border-gray-600 text-gray-400 hover:border-cyan-500 hover:text-cyan-500">
                  Continue Shopping
                </Button>
              </Link>
              
              <div className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded text-white cursor-pointer">
                📋 QUOTATION
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 p-6 rounded-lg sticky top-4">
              <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>{formatPrice(getCartTotal())}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Shipping</span>
                  <span>Rs 0.00</span>
                </div>
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex justify-between text-white font-bold text-lg">
                    <span>Total</span>
                    <span className="text-cyan-500">{formatPrice(getCartTotal())}</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-6">
                <h3 className="text-white font-medium mb-3">Payment Method</h3>
                <div className="space-y-2">
                  <label className="flex items-center text-gray-300">
                    <input type="radio" name="payment" defaultChecked className="mr-2" />
                    Pick Up In Store
                  </label>
                  <label className="flex items-center text-gray-300">
                    <input type="radio" name="payment" className="mr-2" />
                    Pay To Bank
                  </label>
                  <label className="flex items-center text-gray-300">
                    <input type="radio" name="payment" className="mr-2" />
                    Sampath Viswa
                  </label>
                  <label className="flex items-center text-gray-300">
                    <input type="radio" name="payment" className="mr-2" />
                    VISA/MASTER Card
                  </label>
                  <label className="flex items-center text-gray-300">
                    <input type="radio" name="payment" className="mr-2" />
                    AMEX Card
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <Link to="/checkout" className="w-full">
                  <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3">
                    CHECKOUT
                  </Button>
                </Link>
                <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3">
                  CONTINUE SHOPPING
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
