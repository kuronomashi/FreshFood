import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Db,auth} from '../Firebase';
import { ProductoInt } from '../Interfaces/InterfacesDeProfuctos';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { GoogleAuthProvider, signInWithPopup, getAuth, User, sendEmailVerification } from "firebase/auth";



export default function HomePage() {
  const { isAuthenticated, login } = useAuth();
  const { addItem } = useCart();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState<ProductoInt[]>([]);
  const [error, setError] = useState<string | null>(null);
  const auth = getAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCollection = collection(Db, 'productos');
        const productSnapshot = await getDocs(productsCollection);
        const productList: ProductoInt[] = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductoInt));
        setProducts(productList);
      } catch (error) {
        setError((error as Error).message);
      } 
    };

    fetchProducts();
  }, []);

  const CrearNuevoUsuario = async  (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await sendEmailVerification(user);
      alert('Se envio el correo de verificacion');
      setShowLogin(false);
    } catch (error) {
      alert('Error al registrar el usuario');
      console.error("Error al acceder con Google:", error);
    }
  };

  const InicioSesionUsuiaro = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (user.emailVerified) {
        alert('Inicio de sesión exitoso');
        login(email);
        setShowLogin(false);
      } else {
        console.log('');
        alert('Por favor verifica tu correo antes de continuar.');
      }
    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
    }
  };

  const AccederconGoogle = async (e: React.FormEvent) => {
    e.preventDefault();
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      alert('Usuario logueado con éxito!');
      const user: User = userCredential.user;
      const emailG: string = user.email ?? ""; 
      const displayNameG: string = user.displayName ?? "Usuario: ";
      alert(`Bienvenido, ${displayNameG}! Has ingresado con el correo: ${emailG}`);
      login(emailG);
      setShowLogin(false);
    } catch (error) {
      console.error("Error al acceder con Google:", error);
    }
  };


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-green-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Fresh Foods Distribution</h1>
            <p className="text-xl mb-8">Premium Quality Fruits, Vegetables, and Dairy Products</p>
            {!isAuthenticated && ( <button  
              onClick={() => setShowLogin(true)}
              className="bg-white text-green-600 font-bold px-6 py-3 rounded-md font-semibold hover:bg-green-50"
            >
              Acceder
            </button>)}
           
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Nuestros productos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src={product.Imagen}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">{product.name}</h3>
                    <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded">
                      {product.category}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-green-600">${product.price}</span>
                    <button
                      onClick={() => addItem({ ...product, quantity: 1 })}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>
            <form onSubmit={InicioSesionUsuiaro}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
              </div>

              <div className="space-y-4">
              <button
                  type="button"
                  onClick={CrearNuevoUsuario}
                  className="text-neutral-500 transition-transform duration-200 hover:scale-105"
                >
                  sing up
                </button>
              <button
                  type="submit"
                  className="bg-green-600 text-xl font-bold text-white w-full py-1 rounded-md hover:bg-green-700 flex justify-center items-center border-3 border-blue-500 transition-transform duration-200 hover:scale-105"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogin(false)}
                  className="bg-white text-xl font-bold text-neutral-500 w-full py-1 rounded-md hover:bg-zinc-100 flex justify-center items-center border-2 border-border-gray-500 transition-transform duration-200 hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={AccederconGoogle}
                  className="bg-white text-xl font-bold text-neutral-500 w-full py-1 rounded-2xl hover:bg-zinc-100 flex justify-center items-center border-2 gradient-border transition-transform duration-200 hover:scale-105"
                >
                  <img src="https://img.icons8.com/?size=512&id=17949&format=png" className="h-6 w-6 mr-4"/>
                  <h1 className="text-center mr-8">Google</h1>
                  
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}