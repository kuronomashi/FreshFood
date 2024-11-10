import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Db } from '../Firebase';
import { ProductoInt } from '../Interfaces/InterfacesDeProfuctos';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { GoogleAuthProvider, signInWithPopup, getAuth, User, sendEmailVerification, sendPasswordResetEmail } from "firebase/auth";
import { AlertType } from '../components/Alert';
import { AlertContainer } from '../components/AlertContainer';
import  BackgroundCarousel  from '../components/BackgorundCarrusel';

interface AlertItem {
  id: string; 
  type: AlertType;
  title: string;
  message: string;
}

export default function HomePage() {
  const { isAuthenticated, login } = useAuth();
  const { addItem } = useCart();
  const [showLogin, setShowLogin] = useState(false);
  const [esadmin, CambiarUsuarioA] = useState(false);
  const [email, setEmail] = useState('');
  const { items } = useCart();
  
  const [showFloatingCart, setShowFloatingCart] = useState(false);
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState<ProductoInt[]>([]);
  const [error, setError] = useState<string | null>(null);
  const auth = getAuth();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);


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
    const handleScroll = () => {
      const scrolledPastNavbar = window.scrollY > 100 ; 
      setShowFloatingCart(scrolledPastNavbar);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
    
  }, []);


  const addAlert = (type: AlertType, title: string, message: string) => {
    const newAlert = {
      id: Date.now().toString(),
      type,
      title,
      message,
    };
    setAlerts((prev) => [...prev, newAlert]);
    setTimeout(() => removeAlert(newAlert.id), 5000);
  };

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const CrearNuevoUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await sendEmailVerification(user);
      addAlert(
        'success',
        'Correo de verificacion enviado',
        'Revisa tu correo electrónico para verificar tu cuenta'
      );
      setShowLogin(false);
    } catch (error) {
      addAlert(
        'error',
        'Error no se puede crear el nuevo usuario',
        'Revisa que tu correo este bien escrito la contraeña debe tener minimo 6 digitos'
      );
    }
  };

  const RecuperarContraseña = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      addAlert(
        'success',
        'Correo para retaurar tu contraseña enviado',
        'Revisa tu correo electrónico para recuperar tu cuenta'
      );
    } catch (error) {
      addAlert(
        'error',
        'Error no se puede retablecer la contraña',
        'Revisa que tu correo este bien escrito'
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (user.emailVerified) {
        login(email);
        setShowLogin(false);
      } else {
        console.log('');
        alert('Por favor verifica tu correo antes de continuar.');
      }
    } catch (error) {
      addAlert(
        'error',
        'Error al inicar sesion',
        'Revisa tu correo y contraeña'
      );
    }
  };

  const AccederconGoogle = async (e: React.FormEvent) => {
    e.preventDefault();
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user: User = userCredential.user;
      const emailG: string = user.email ?? "";
      const displayNameG: string = user.displayName ?? "Usuario: ";
      login(emailG);
      setShowLogin(false);
    } catch (error) {
      console.error("Error al acceder con Google:", error);
    }
  };

  const CombrobarCorreoDeAdministrador = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const correo = e.target.value;
    setEmail(e.target.value)
    if (correo == import.meta.env.VITE_Admin1) {
      CambiarUsuarioA(true)
    } else {
      CambiarUsuarioA(false)
    }
  };

  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(product => product.category === selectedCategory);

  // Manejar el cambio de categoría
  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(event.target.value);
  };
  return (

    <div className="min-h-screen">
      {/* Hero Section */}
      <AlertContainer alerts={alerts} onDismiss={removeAlert} />
      <section className="relative bg-black text-white py-36">
        <BackgroundCarousel/>
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-8xl md:text-6lg font-semibold font-mitr mb-6 text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            Fresh Foods 
            </h1>
            <p className="text-xl font-montserrat font-commissioner md:text-xl mb-8 text-gray-200">
              <h1 className='drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]'>Frutas, verduras y otros productos de primera calidad</h1>
            </p>
            {!isAuthenticated && (
              <button
              onClick={() => setShowLogin(true)}
              className="inline-flex items-center bg-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-700 transition-colors transition-transform transform hover:scale-105"
            >
              <h1 className='font-commissioner text-xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]'>Acceder</h1>
            </button>)}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className='flex flex-col items-center text-center mb-8'>
            <h2 className="font-commissioner font-extrabold text-3xl font-bold text-center mb-8">Nuestros productos</h2>
            <div className="flex items-center mb-8">
              <label htmlFor="category" className="font-commissioner font-extrabold mr-4 text- font-medium">Filtrar:</label>
              <select
                id="category"
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="font-commissioner font-semibold px-2 border rounded-md appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-green-700 pr-8"
              >
                <option value="All">Todos</option>
                <option value="Frutas">Frutas</option>
                <option value="Vegetales">Vegetales</option>
                <option value="Otros">Otros</option>
                {/* Añade más opciones según tus categorías */}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {filteredProducts.filter((product) => product.stock > 0).map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src={product.Imagen}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-custom font-extrabold text-lg font-semibold break-words max-w-[250px] break-words">{product.name}</h3>
                    </div>

                    <div>
                      <span className="font-commissioner font-semibold bg-green-100 text-green-800 text-sm px-2 py-1 rounded">
                        {product.category}
                      </span>
                    </div>

                  </div>
                  <p className="text-gray-600 mb-4 break-words">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-green-600">${product.price.toFixed(2)}</span>
                    {isAuthenticated && (
                      <button
                        onClick={() => addItem({ ...product, quantity: 1 })}
                        className="font-roboto font-bold flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transform transition-transform duration-150 active:scale-110"
                      >
                        <ShoppingCart className="h-5 w-5" />
                        <span>Añadir a la Cesta</span>
                      </button>
                    )}

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
          <AlertContainer alerts={alerts} onDismiss={removeAlert} />
            <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email || ''}
                  onChange={CombrobarCorreoDeAdministrador}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password || ''}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
              </div>

              <div className="space-y-4">
                {!esadmin && (
                  <div className='flex justify-between'>
                    <button
                      type="button"
                      onClick={CrearNuevoUsuario}
                      className="text-neutral-500 transition-transform duration-200 hover:scale-105"
                    >
                      sing up
                    </button>
                    <button
                      type="button"
                      onClick={RecuperarContraseña}
                      className="text-neutral-500 transition-transform duration-200 hover:scale-105"
                    >
                      forget password?
                    </button>
                  </div>
                )}
                <button
                  type="submit"
                  className="bg-green-600 text-xl font-bold text-white w-full py-1 rounded-md hover:bg-green-700 flex justify-center items-center border-3 border-blue-500 transition-transform duration-200 hover:scale-105"
                >
                  Login
                </button>
                <button
                  onClick={AccederconGoogle}
                  className="bg-white text-xl font-bold text-neutral-500 w-full py-1 rounded-2xl hover:bg-zinc-100 flex justify-center items-center border-2 gradient-border transition-transform duration-200 hover:scale-105"
                >
                  <img src="https://img.icons8.com/?size=512&id=17949&format=png" className="h-6 w-6 mr-4" />
                  <h1 className="text-center mr-8">Google</h1>

                </button>
                <button
                  type="button"
                  onClick={() => setShowLogin(false)}
                  className="bg-white text-xl font-bold text-neutral-500 w-full py-1 rounded-md hover:bg-zinc-100 flex justify-center items-center border-2 border-border-gray-500 transition-transform duration-200 hover:scale-105"
                >
                  Cancel
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

  {showFloatingCart && isAuthenticated && (
        <Link to="/order" className="fixed bottom-8 right-8 z-50">
          <div className="relative p-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-transform transform hover:scale-110">
            <ShoppingCart className="h-6 w-6" />
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {items.length}
              </span>
            )}
          </div>
        </Link>
      )}  
      
    </div>
  );
}