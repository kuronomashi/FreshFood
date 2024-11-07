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
    // Handle order submissi
    console.log(items.length != 0)
    if (items.length != 0) {
      CambiarStock(items);
    } else {
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
    deliveryInfo.id = product.id
    const blob = await pdf(<PdfGenrate Order={deliveryInfo} CarInfo={items} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Resumen de Factura (${deliveryInfo.id}).pdf`;
    link.click();
    URL.revokeObjectURL(url); // Limpiar la URL después de la descarga
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Tu Orden</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cart Items */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Items en la Cesta</h2>
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
              <h2 className="text-xl font-semibold mb-4">Infomacion de envio</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    required
                    value={deliveryInfo.name}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      // Permitir solo letras y hasta 20 caracteres
                      if (/^[a-zA-ZáéíóúÁÉÍÓÚ\s]*$/.test(newValue) && newValue.length <= 40) {
                        setDeliveryInfo({ ...deliveryInfo, name: newValue });
                      }
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefono</label>
                  <input
                    type="text"
                    required
                    value={deliveryInfo.phone}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      // Permitir solo números hasta que alcancen exactamente 10 dígitos
                      if (/^\d{0,10}$/.test(newValue)) {
                        setDeliveryInfo({ ...deliveryInfo, phone: newValue });
                      }
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dirección</label>
                  <input
                    type="text"
                    required
                    value={deliveryInfo.address}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      // Permitir solo letras, números, espacios, y algunos caracteres especiales, hasta un máximo de 10 caracteres
                      if (/^[a-zA-Z0-9\s.,#-]*$/.test(newValue) && newValue.length <= 25) {
                        setDeliveryInfo({ ...deliveryInfo, address: newValue });
                      }
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Informacion de Pago</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Numero de la Tarjeta</label>
                  <input
                    type="text"
                    required
                    value={paymentInfo.cardNumber}
                    onChange={(e) => {
                      let newValue = e.target.value.replace(/\D/g, ""); // Eliminar cualquier carácter no numérico
                      newValue = newValue.replace(/(\d{4})(?=\d)/g, "$1 "); // Agregar un espacio cada 4 dígitos
                  
                      if (newValue.length <= 19) { // Limitar la entrada a 19 caracteres (16 dígitos + 3 espacios)
                        setPaymentInfo({ ...paymentInfo, cardNumber: newValue });
                      }
                    }}
                    placeholder="0000 0000 0000 0000"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Expiracion</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      required
                      value={paymentInfo.expiryDate}
                      onChange={(e) => {
                        let newValue = e.target.value.replace(/\D/g, ""); // Eliminar caracteres no numéricos
                    
                        // Limitar la longitud a 4 caracteres (2 para el mes y 2 para el año)
                        if (newValue.length <= 4) {
                          // Formatear el valor como MM/YY
                          if (newValue.length >= 3) {
                            newValue = newValue.slice(0, 2) + "/" + newValue.slice(2, 4); // Insertar barra
                          }
                          setPaymentInfo({ ...paymentInfo, expiryDate: newValue });
                        }
                      }}
                      
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CVV</label>
                    <input
                      type="text"
                      required
                      value={paymentInfo.cvv}
                      onChange={(e) => {
                        const newValue = e.target.value.replace(/\D/g, ""); // Eliminar cualquier carácter no numérico
                        // Limitar la longitud a 3 dígitos
                        if (newValue.length <= 3) {
                          setPaymentInfo({ ...paymentInfo, cvv: newValue });
                        }
                      
                      }}
                      placeholder="000"

                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="font-bold text-lg w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Realizar Pedido
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}