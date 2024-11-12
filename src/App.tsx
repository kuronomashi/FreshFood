
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import OrderPage from './pages/OrderPage';
import AdminPedido from './pages/Adminpepedidos';
import AdminDashboard from './pages/AdminDashboard';
import AdminInventory from './pages/AdminInventory';
import AddProduct from './pages/AddProduct';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedRouteAuth from './components/ProtectedRouteAuteticate';
import Audio from "./components/ReproductorAudio"


function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Audio />
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage/>} />
                
                <Route path="/order" element={<ProtectedRouteAuth> <OrderPage /></ProtectedRouteAuth>} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/inventory"
                  element={
                    <ProtectedRoute>
                      <AdminInventory />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/admin/products/new"
                  element={
                    <ProtectedRoute>
                      <AddProduct />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/pedidos"
                  element={
                    <ProtectedRoute>
                      <AdminPedido />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );

  
}export default App;