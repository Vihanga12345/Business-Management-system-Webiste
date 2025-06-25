
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';

const Favorites = () => {
  const { favorites } = useApp();

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 py-20">
        <div className="container mx-auto px-6 text-center">
          <Heart className="w-32 h-32 text-gray-600 mx-auto mb-8" />
          <h1 className="text-4xl font-bold text-white mb-6">Your favorites is empty</h1>
          <p className="text-gray-400 mb-12 text-lg">Save some products you love to find them quickly!</p>
          <Link to="/collections">
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white px-10 py-4 text-lg">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold text-white mb-12">
          My Favorites ({favorites.length})
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {favorites.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Favorites;
