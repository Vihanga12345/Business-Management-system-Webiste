
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, ShoppingCart, User } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';

const Header = () => {
  const { getCartCount } = useApp();
  const { user, logout } = useAuth();
  const location = useLocation();
  const cartCount = getCartCount();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        {/* Top bar with contact info */}
        <div className="flex justify-between items-center py-4 text-sm text-gray-400 border-b border-gray-800">
          <div className="flex items-center space-x-8">
            <span className="flex items-center space-x-2">
              <span>📞</span>
              <span>+94 777 531 175</span>
            </span>
            <span className="flex items-center space-x-2">
              <span>💬</span>
              <span>+94 777 531 165</span>
            </span>
          </div>
        </div>

        {/* Main header */}
        <div className="flex items-center justify-between py-6">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">G</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">GEOLEX</h1>
              <p className="text-sm text-gray-400">YOUR TRUSTED PC PARTNER</p>
            </div>
          </Link>



          {/* Action buttons */}
          <div className="flex items-center space-x-6">
            <Link to="/favorites" className="text-gray-400 hover:text-cyan-500 transition-colors p-2">
              <Heart className="w-6 h-6" />
            </Link>
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">Welcome, {user.first_name}</span>
                <button 
                  onClick={logout}
                  className="text-gray-400 hover:text-cyan-500 transition-colors text-sm underline"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-gray-400 hover:text-cyan-500 transition-colors p-2">
                <User className="w-6 h-6" />
              </Link>
            )}
            <Link to="/cart" className="relative text-gray-400 hover:text-cyan-500 transition-colors p-2">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <nav className="py-4 border-t border-gray-800">
          <div className="flex space-x-12">
            <Link
              to="/"
              className={`text-base font-medium transition-colors hover:text-cyan-500 py-2 ${
                isActive('/') ? 'text-cyan-500' : 'text-gray-300'
              }`}
            >
              Home
            </Link>
            <Link
              to="/collections"
              className={`text-base font-medium transition-colors hover:text-cyan-500 py-2 ${
                isActive('/collections') ? 'text-cyan-500' : 'text-gray-300'
              }`}
            >
              Collections
            </Link>
            <Link
              to="/cart"
              className={`text-base font-medium transition-colors hover:text-cyan-500 py-2 ${
                isActive('/cart') ? 'text-cyan-500' : 'text-gray-300'
              }`}
            >
              Cart
            </Link>
            <Link
              to="/favorites"
              className={`text-base font-medium transition-colors hover:text-cyan-500 py-2 ${
                isActive('/favorites') ? 'text-cyan-500' : 'text-gray-300'
              }`}
            >
              Favorites
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
