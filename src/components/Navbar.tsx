import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import HomePage from '../pages/HomePage';

export default function Navbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { items } = useCart();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);  

  return (
    <nav className="bg-green-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl">Fresh Foods</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="hover:text-green-200">Home</Link>
            <Link to="/order" className="hover:text-green-200">Order</Link>
            {isAdmin && (
              <Link to="/admin" className="hover:text-green-200">Admin</Link>
            )}
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <button
                  onClick={logout}
                  className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded-md"
                >
                  Logout
                </button>
              ) : (
                <User className="h-6 w-6 cursor-pointer"/>
                
              )}
              
              <div className="relative">
                <ShoppingCart className="h-6 w-6 cursor-pointer" />
                {items.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {items.length}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:text-green-200"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 hover:bg-green-700 rounded-md">Home</Link>
            <Link to="/order" className="block px-3 py-2 hover:bg-green-700 rounded-md">Order</Link>
            {isAdmin && (
              <Link to="/admin" className="block px-3 py-2 hover:bg-green-700 rounded-md">Admin</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}