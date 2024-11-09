import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, User2Icon} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { items } = useCart();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);  

  const SalirDelaeion = () => {
    navigate("/")
    logout()
  };

  return (
    <nav className="bg-green-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-bold text-2xl">Fresh Foods</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
          {isAuthenticated && (
              <Link to="/" className="hover:text-green-200">Inicio</Link>
            )}
            {isAuthenticated && (
              <Link to="/order" className="hover:text-green-200">Pedido</Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="flex items-center hover:text-green-200">
                <User2Icon className="h-4 w-4" />
                Administrador</Link>
            )}
            
            <div className="flex items-center space-x-4">
              {isAuthenticated && (
                <button
                  onClick={SalirDelaeion}
                  className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded-md"
                >
                  Logout
                </button>
              ) }
               {isAuthenticated && (
              <Link to="/order" className="hover:text-green-200">
                <div className="relative">
                <ShoppingCart className="h-6 w-6 cursor-pointer" />
                {items.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {items.length}
                  </span>
                )}
              </div>

              </Link>
            )}
              
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
            {isAuthenticated && (
            <Link to="/order" className="block px-3 py-2 hover:bg-green-700 rounded-md">Order</Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="block px-3 py-2 hover:bg-green-700 rounded-md">Admin</Link>
            )}
            {isAuthenticated && (
            <button
            onClick={SalirDelaeion}
            className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded-md"
          >
            Logout
          </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}