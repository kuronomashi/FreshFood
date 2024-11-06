import React, { useState, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { pdf } from '@react-pdf/renderer';
import { useNavigate } from 'react-router-dom';
import PdfGenrate from '../components/PdfOrder';
import { Pedidos, ProductoInt } from '../Interfaces/InterfacesDeProfuctos';
import { collection, addDoc, updateDoc, getDoc, doc } from 'firebase/firestore';
import { Db } from '../Firebase';
import { Eraser } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DeliveryInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}
interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

export default function OrderPage() {

  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductoInt[]>([]);
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();

  const [deliveryInfo, setDeliveryInfo] = useState<Pedidos>({
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    productos: [],
    date: ''
  });
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const today = new Date();
  const formattedDate = today.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const formattedTime = today.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const [product, setPedido] = useState<Pedidos>({
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    productos: [],
    date: ''
  });

  const CambiarStock = async (items: { id: string; quantity: number }[]) => {
    try {
      for (const item of items) {
        const productDoc = doc(Db, 'productos', item.id);
        const productSnap = await getDoc(productDoc);
        if (productSnap.exists()) {
          const product = productSnap.data();
          const updatedStock = product.stock - item.quantity;
          if (updatedStock < 0) {
            alert("No hay suficiente stock");
            clearCart();
            navigate("/");
            return;
          }
        }
      }
      for (const item of items) {
        const productDoc = doc(Db, 'productos', item.id);
        const productSnap = await getDoc(productDoc);
        if (productSnap.exists()) {
          const product = productSnap.data();
          const updatedStock = product.stock - item.quantity;
          await updateDoc(productDoc, { stock: updatedStock });
          setProducts((prevProducts) =>
            prevProducts.map((product) =>
              product.id === item.id
                ? { ...product, stock: updatedStock }
                : product
            )
          );
        }
      }
      alert('Order submitted:');
      GuardarPedidos();
      CrearPdf(); 
    } catch (error) {
      console.error("Error al actualizar el stock de los productos:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle order submission
    if (items.length != 0) {
      CambiarStock(items);
    }else{
      alert("Porfavor seleccione un producto");
    }

  };

  if (!user) {
    return <p>No estás autenticado no deberias ver esta pagina</p>;
  }
  const GuardarPedidos = async () => {
    deliveryInfo.email = user.email;
    product.name = deliveryInfo.name;
    product.email = user.email;
    product.phone = deliveryInfo.phone;
    product.address = deliveryInfo.address;
    product.productos = items;
    product.date = formattedDate + " - " + formattedTime;
    try {
      // Agregar producto a Firestore
      const productsCollection = collection(Db, 'Pedidos');
      const docRef = await addDoc(productsCollection, product);
      const generatedId = docRef.id;
      await updateDoc(docRef, { id: generatedId });
      alert('Producto agregado exitosamente.');
      clearCart();
      navigate('/ '); // Redirigir después de agregar el producto
    } catch (error) {
      console.error('Error al agregar el producto:', error);
      alert('Hubo un error al agregar el producto.');
    }
  };



  const CrearPdf = async () => {
    const blob = await pdf(<PdfGenrate Order={deliveryInfo} CarInfo={items} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Resumen de Factura.pdf';
    link.click();
    URL.revokeObjectURL(url); // Limpiar la URL después de la descarga
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Your Order</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cart Items */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Cart Items</h2>
          {items.length === 0 ? (
            <p className="text-gray-500">No tienes productos</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b pb-4">
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-gray-600">${item.price} dollar</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        // Si el valor ingresado es mayor que el stock, ajustamos a stock disponible
                        if (value <= item.stock) {
                          updateQuantity(item.id, value);
                        } else {
                          updateQuantity(item.id, item.stock); // Restablecer al stock disponible si es mayor
                        }
                      }}
                      className="w-20 px-2 py-1 border rounded"
                    />
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Eraser className="mr-1" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="pt-4 text-right">
                <p className="text-xl font-bold">Total: ${total.toFixed(2)}</p>
              </div>

            </div>
          )}
        </div>


        {/* Order Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    required
                    value={deliveryInfo.name}
                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    required
                    value={deliveryInfo.phone}
                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, phone: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <textarea
                    required
                    value={deliveryInfo.address}
                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, address: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Card Number</label>
                  <input
                    type="text"
                    required
                    value={paymentInfo.cardNumber}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      required
                      value={paymentInfo.expiryDate}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, expiryDate: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CVV</label>
                    <input
                      type="text"
                      required
                      value={paymentInfo.cvv}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Place Order
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}