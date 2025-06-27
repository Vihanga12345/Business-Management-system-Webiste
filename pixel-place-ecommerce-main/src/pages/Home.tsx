import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, ArrowRight, CheckCircle } from 'lucide-react';
import { getSaleProducts, getCategories } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Product } from '@/types';

// Category icons mapping for IT hardware
const categoryIcons: { [key: string]: string } = {
  'Laptops': '💻',
  'Desktop PCs': '🖥️',
  'Monitors': '📺',
  'Keyboards': '⌨️',
  'Mice & Pointing': '🖱️',
  'Speakers & Audio': '🔊',
  'Headphones': '🎧',
  'Webcams': '📹',
  'Storage Devices': '💾',
  'Memory (RAM)': '🧠',
  'Graphics Cards': '🎮',
  'Processors': '⚡',
  'Motherboards': '🔌',
  'Power Supplies': '🔋',
  'Cases & Cooling': '❄️',
  'Cables & Adapters': '🔗',
  'Networking': '🌐',
  'Printers': '🖨️',
  'Tablets': '📱',
  'Accessories': '🔧',
  'Electronics': '💻',
  'Hardware': '🔧',
  'default': '📦'
};

const Home = () => {
  console.log("Home component is rendering");
  
  const location = useLocation();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);

  // Check for order confirmation in navigation state
  const orderConfirmation = location.state?.orderConfirmation;

  useEffect(() => {
    if (orderConfirmation) {
      setShowOrderConfirmation(true);
      // Clear the state to prevent showing confirmation on refresh
      window.history.replaceState({}, document.title);
      
      // Auto-hide confirmation after 10 seconds
      setTimeout(() => {
        setShowOrderConfirmation(false);
      }, 10000);
    }
  }, [orderConfirmation]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log('Loading featured products and categories...');
        
        // Get sale products for featured section
        const saleProducts = await getSaleProducts();
        setFeaturedProducts(saleProducts.slice(0, 8)); // Show more products
        
        // Get categories for navigation
        const categoryList = await getCategories();
        setCategories(categoryList);
        
        console.log("Featured products:", saleProducts.slice(0, 8));
        console.log("Categories:", categoryList);
      } catch (error) {
        console.error('Error loading home page data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const getCategoryIcon = (category: string): string => {
    return categoryIcons[category] || categoryIcons.default;
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Order Confirmation Alert */}
      {showOrderConfirmation && orderConfirmation && (
        <div className="bg-green-600 text-white py-4">
          <div className="container mx-auto px-6">
            <Alert className="bg-green-600 border-green-500">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-white">
                <strong>Order placed successfully!</strong> Your order {orderConfirmation.orderNumber} 
                has been placed and is being processed. 
                {orderConfirmation.erpOrderNumber && (
                  <span> ERP Order: {orderConfirmation.erpOrderNumber}</span>
                )}
                <button 
                  onClick={() => setShowOrderConfirmation(false)}
                  className="ml-4 text-white underline hover:no-underline"
                >
                  Dismiss
                </button>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-gray-800 to-gray-700 py-24">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-3xl">
              <h1 className="text-6xl font-bold text-white mb-6">
                IT Hardware Store
              </h1>
              <h2 className="text-5xl font-bold text-cyan-500 mb-6">
                #QualityTech
              </h2>
              <p className="text-2xl text-gray-300 mb-10">
                Professional IT equipment for businesses and enthusiasts
              </p>
              <Link to="/collections">
                <Button className="bg-cyan-500 hover:bg-cyan-600 text-white px-10 py-4 rounded-lg text-xl">
                  Shop Now <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
              </Link>
            </div>
            <div className="flex-1 flex justify-center">
              <img
                src="https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600&h=400&fit=crop"
                alt="IT Hardware"
                className="max-w-lg rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto px-6">
          <h2 className="text-center text-3xl font-bold text-white mb-8">Shop by Category</h2>
          {isLoading ? (
            <div className="text-center text-white">Loading categories...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {categories.map((category) => (
                <Link
                  key={category}
                  to={`/collections?category=${encodeURIComponent(category)}`}
                  className="bg-gray-700 hover:bg-gray-600 p-6 rounded-lg text-center transition-all duration-300 group hover:scale-105 hover:shadow-lg"
                >
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {getCategoryIcon(category)}
                  </div>
                  <div className="text-white text-sm group-hover:text-cyan-500 font-medium">
                    {category}
                  </div>
                </Link>
              ))}
              
              {/* Show All Products tile */}
              <Link
                to="/collections"
                className="bg-gradient-to-br from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 p-6 rounded-lg text-center transition-all duration-300 group hover:scale-105 hover:shadow-lg"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  🛒
                </div>
                <div className="text-white text-sm font-medium">
                  All Products
                </div>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-cyan-500 text-xl font-medium mb-4">Featured Products</h2>
            <h3 className="text-5xl font-bold text-white mb-6">SPECIAL OFFERS</h3>
            <div className="w-24 h-1 bg-cyan-500 mx-auto"></div>
          </div>

          {isLoading ? (
            <div className="text-center text-white text-xl">Loading featured products...</div>
          ) : featuredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <div className="text-center mt-16">
                <Link to="/collections">
                  <Button className="bg-cyan-500 hover:bg-cyan-600 text-white px-10 py-4 rounded-lg text-lg">
                    View All Products <ArrowRight className="ml-3 w-6 h-6" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center text-white">
              <p className="text-xl mb-4">No featured products available at the moment.</p>
              <p className="text-gray-400">Please check back later or contact us for more information.</p>
              <div className="mt-8">
                <Link to="/collections">
                  <Button className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3 rounded-lg">
                    Browse All Products
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto px-6">
          <h2 className="text-center text-3xl font-bold text-white mb-12">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-5xl mb-4">🚚</div>
              <h3 className="text-xl font-bold text-white mb-2">Fast Delivery</h3>
              <p className="text-gray-400">Quick and reliable shipping on all orders</p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold text-white mb-2">Quality Guarantee</h3>
              <p className="text-gray-400">Only genuine, high-quality IT hardware</p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-xl font-bold text-white mb-2">Expert Support</h3>
              <p className="text-gray-400">Professional technical support team</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
