import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, ArrowLeft } from 'lucide-react';
import { getProductById } from '@/data/products';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import AuthDialog from '@/components/AuthDialog';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart, addToFavorites, removeFromFavorites, favorites } = useApp();
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<'cart' | 'favorite' | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        console.log('Loading product with ID:', id);
        
        const productData = await getProductById(id);
        setProduct(productData);
        
        if (!productData) {
          setError('Product not found');
        } else {
          console.log('Loaded product:', productData);
        }
      } catch (error) {
        console.error('Error loading product:', error);
        setError('Failed to load product');
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const isFavorite = product ? favorites.some(fav => fav.id === product.id) : false;

  const handleFavoriteClick = () => {
    if (!product) return;
    
    if (!isAuthenticated) {
      setPendingAction('favorite');
      setShowAuthDialog(true);
      return;
    }
    
    if (isFavorite) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    if (!isAuthenticated) {
      setPendingAction('cart');
      setShowAuthDialog(true);
      return;
    }
    
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  const handleAuthSuccess = () => {
    if (!product || !pendingAction) return;
    
    if (pendingAction === 'cart') {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
    } else if (pendingAction === 'favorite') {
      addToFavorites(product);
    }
    
    setPendingAction(null);
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-white mb-4">Loading product from ERP...</div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            {error || 'Product not found'}
          </h1>
          <p className="text-gray-400 mb-6">
            The product may have been removed from inventory or is no longer available.
          </p>
          <Link to="/collections">
            <Button className="bg-cyan-500 hover:bg-cyan-600">
              Back to Collections
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/collections" className="text-cyan-500 hover:text-cyan-400 flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Collections
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <img
              src={product.image}
              alt={product.name}
              className="w-full rounded-lg shadow-lg"
            />
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-4">{product.name}</h1>
            
            {/* Category */}
            <div className="mb-4">
              <span className="text-cyan-500 text-sm font-medium">
                {product.category.toUpperCase()}
              </span>
            </div>

            {/* SKU and Unit */}
            {(product.sku || product.unitOfMeasure) && (
              <div className="mb-4 space-y-1">
                {product.sku && (
                  <div className="text-gray-400 text-sm">
                    SKU: <span className="text-white">{product.sku}</span>
                  </div>
                )}
                {product.unitOfMeasure && (
                  <div className="text-gray-400 text-sm">
                    Unit: <span className="text-white">{product.unitOfMeasure}</span>
                  </div>
                )}
              </div>
            )}

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating!)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-400'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-400 ml-2">({product.rating})</span>
              </div>
            )}

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-cyan-500">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                {product.isOnSale && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">
                    SALE
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-white mb-2">Description</h3>
              <p className="text-gray-300">{product.description}</p>
            </div>

            {/* Specifications */}
            {product.specs && product.specs.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">Specifications</h3>
                <ul className="text-gray-300 space-y-1">
                  {product.specs.map((spec, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-cyan-500 rounded-full mr-3"></span>
                      {spec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Stock Status */}
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  product.inStock && product.stock > 0
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {product.inStock && product.stock > 0 
                    ? `In Stock (${product.stock} available)` 
                    : 'Out of Stock'
                  }
                </span>
                <span className="text-gray-400 text-sm">• Live from ERP</span>
              </div>
            </div>

            {/* Weight */}
            {product.weight && (
              <div className="mb-4">
                <span className="text-gray-400 text-sm">
                  Weight: <span className="text-white">{product.weight} kg</span>
                </span>
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="space-y-4">
              {product.inStock && product.stock > 0 && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-white">Quantity:</label>
                    <div className="flex items-center bg-gray-800 rounded">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-1 text-white hover:bg-gray-700 rounded-l"
                      >
                        -
                      </button>
                      <span className="px-4 py-1 text-white">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="px-3 py-1 text-white hover:bg-gray-700 rounded-r"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.inStock || product.stock === 0}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white py-3 disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {product.inStock && product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                
                <Button
                  onClick={handleFavoriteClick}
                  variant="outline"
                  className={`p-3 ${
                    isFavorite
                      ? 'bg-cyan-500 border-cyan-500 text-white'
                      : 'border-gray-600 text-gray-400 hover:border-cyan-500 hover:text-cyan-500'
                  }`}
                >
                  <Heart className="w-5 h-5" />
                </Button>
              </div>

              {product.inStock && product.stock > 0 && (
                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                >
                  Buy Now
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <AuthDialog 
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default ProductDetail;
