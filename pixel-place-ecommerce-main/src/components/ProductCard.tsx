
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import AuthDialog from '@/components/AuthDialog';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, addToFavorites, removeFromFavorites, favorites } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const isFavorite = favorites.some(fav => fav.id === product.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only require auth for favorites, not for cart operations
    if (!user) {
      setPendingProduct(product);
      setShowAuthDialog(true);
      return;
    }
    
    console.log('Favorite button clicked for product:', product.id);
    console.log('Is currently favorite:', isFavorite);
    
    if (isFavorite) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product);
    }
  };

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Require authentication for cart operations
    if (!user) {
      // Redirect to login page
      navigate('/login');
      return;
    }
    
    addToCart(product);
  };

  const handleAuthSuccess = () => {
    if (pendingProduct) {
      // This is for favorites only now
      addToFavorites(pendingProduct);
      setPendingProduct(null);
    }
  };

  const formatPrice = (price: number) => {
    return `Rs ${price.toLocaleString()}.00`;
  };

  return (
    <>
      <div className="bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300 group shadow-lg">
      {/* Product image */}
      <div className="relative overflow-hidden">
        {/* Stock badge */}
        {product.inStock && (
          <div className="absolute top-4 left-4 z-20">
            <span className="bg-green-500 text-white text-xs px-3 py-2 rounded font-bold">
              IN STOCK
            </span>
          </div>
        )}

        <img
          src={product.image}
          alt={product.name}
          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        
        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-4 right-4 z-20 p-3 rounded-full transition-colors ${
            isFavorite 
              ? 'bg-cyan-500 text-white' 
              : 'bg-white/80 text-gray-600 hover:bg-cyan-500 hover:text-white'
          }`}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Quick actions overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex space-x-4">
            <Button
              onClick={handleAddToCart}
              className="bg-cyan-500 hover:bg-cyan-600 text-white p-3 rounded-full"
            >
              <ShoppingCart className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Product info */}
      <div className="p-6 space-y-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-white font-medium hover:text-cyan-500 transition-colors text-lg leading-relaxed">
            {product.name}
          </h3>
        </Link>
        
        <div className="text-center py-2">
          <span className="text-gray-400 text-sm font-medium tracking-wider">
            - {product.category.toUpperCase()} -
          </span>
        </div>

        <div className="text-center py-2">
          <div className="text-cyan-500 font-bold text-xl">
            {formatPrice(product.price)}
          </div>
          {product.originalPrice && (
            <div className="text-gray-500 line-through text-sm mt-1">
              {formatPrice(product.originalPrice)}
            </div>
          )}
        </div>

        <div className="flex justify-center pt-4">
          <Button
            onClick={handleAddToCart}
            className="bg-gray-700 hover:bg-cyan-500 text-white transition-colors w-12 h-12 p-0 rounded"
          >
            <ShoppingCart className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>

    <AuthDialog 
      isOpen={showAuthDialog}
      onClose={() => setShowAuthDialog(false)}
      onAuthSuccess={handleAuthSuccess}
    />
    </>
  );
};

export default ProductCard;
