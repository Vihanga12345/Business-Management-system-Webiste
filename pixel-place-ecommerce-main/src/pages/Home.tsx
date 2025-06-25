import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, ArrowRight, CheckCircle } from 'lucide-react';
import { getSaleProducts, getCategories } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Product } from '@/types';

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
        setFeaturedProducts(saleProducts.slice(0, 6));
        
        // Get categories for navigation
        const categoryList = await getCategories();
        setCategories(categoryList);
        
        console.log("Featured products:", saleProducts.slice(0, 6));
        console.log("Categories:", categoryList);
      } catch (error) {
        console.error('Error loading home page data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

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
                Welcome to Our Store
              </h1>
              <h2 className="text-5xl font-bold text-cyan-500 mb-6">
                #RealTimeInventory
              </h2>
              <p className="text-2xl text-gray-300 mb-10">
                Products synced directly from our ERP system
              </p>
              <Button className="bg-cyan-500 hover:bg-cyan-600 text-white px-10 py-4 rounded-lg text-xl">
                Explore Now <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
            </div>
            <div className="flex-1 flex justify-center">
              <img
                src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop"
                alt="Our Products"
                className="max-w-lg rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
        <Button className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-cyan-500 hover:bg-cyan-600 rounded-full p-3">
          <ChevronRight className="w-8 h-8" />
        </Button>
      </section>

      {/* Category Navigation */}
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto px-6">
          <h2 className="text-center text-3xl font-bold text-white mb-8">Shop by Category</h2>
          {isLoading ? (
            <div className="text-center text-white">Loading categories...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link
                  key={category}
                  to={`/collections?category=${category}`}
                  className="bg-gray-700 hover:bg-gray-600 p-6 rounded-lg text-center transition-colors group"
                >
                  <div className="text-3xl mb-4">📦</div>
                  <div className="text-white text-sm group-hover:text-cyan-500 font-medium">
                    {category}
                  </div>
                </Link>
              ))}
              {/* Add some default categories if no database categories */}
              {categories.length === 0 && !isLoading && [
                { name: 'Electronics', icon: '💻' },
                { name: 'Accessories', icon: '🔧' },
                { name: 'All Products', icon: '📦' },
              ].map((category) => (
                <Link
                  key={category.name}
                  to={`/collections?category=${category.name}`}
                  className="bg-gray-700 hover:bg-gray-600 p-6 rounded-lg text-center transition-colors group"
                >
                  <div className="text-3xl mb-4">{category.icon}</div>
                  <div className="text-white text-sm group-hover:text-cyan-500 font-medium">
                    {category.name}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Special Offers Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-cyan-500 text-xl font-medium mb-4">Live from ERP</h2>
            <h3 className="text-5xl font-bold text-white mb-6">SPECIAL OFFERS</h3>
            <div className="w-24 h-1 bg-cyan-500 mx-auto"></div>
          </div>

          {isLoading ? (
            <div className="text-center text-white text-xl">Loading featured products...</div>
          ) : featuredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              <p className="text-xl mb-4">No products available at the moment.</p>
              <p className="text-gray-400">Please check back later or contact us for more information.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
