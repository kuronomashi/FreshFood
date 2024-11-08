import React, { useState, useRef,useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { pdf } from '@react-pdf/renderer';
import { useNavigate } from 'react-router-dom';
import PdfGenrate from '../components/PdfOrder';
import { Pedidos, ProductoInt } from '../Interfaces/InterfacesDeProfuctos';
import { collection, addDoc, updateDoc, getDoc, doc } from 'firebase/firestore';
import { Db } from '../Firebase';
import { Eraser } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AlertType } from '../components/Alert';
import { AlertContainer } from '../components/AlertContainer';
import { PurchaseConfirmation } from '../components/PurchaseConfirmation';


interface AlertItem {
  id: string; 
  type: AlertType;
  title: string;
  message: string;
}

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
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [prossesPay, setBotonDeCompra] = useState(false);

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


  useEffect(() => {
    const savedDeliveryInfo = localStorage.getItem("deliveryInfo");
    const savedPaymentInfo = localStorage.getItem("paymentInfo");

    if (savedDeliveryInfo) setDeliveryInfo(JSON.parse(savedDeliveryInfo));
    if (savedPaymentInfo) setPaymentInfo(JSON.parse(savedPaymentInfo));
  }, []);
  useEffect(() => {
    localStorage.setItem("deliveryInfo", JSON.stringify(deliveryInfo));
  }, [deliveryInfo]);

  useEffect(() => {
    localStorage.setItem("paymentInfo", JSON.stringify(paymentInfo));
  }, [paymentInfo]);


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

  const handleConfirmPurchase = () => {
    setBotonDeCompra(true)
    addAlert(
      'success',
      '¡Compra exitosa!',
      'Tu pedido ha sido procesado correctamente.'
    );
    CambiarStock(items);
  };
  const handleCancelPurchase = () => {
    setIsPurchaseModalOpen(false);
    addAlert(
      'info',
      'Compra cancelada',
      'Has cancelado la compra. ¡Te esperamos pronto!'
    );
  };
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
            addAlert(
              'info',
              'No hay suficiente stock',
              'Lamentamos las molestias, porfavor revise de nuevo su carrito'
            );
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
      GuardarPedidos();
      CrearPdf();
      setIsPurchaseModalOpen(false);
      setBotonDeCompra(false)
    } catch (error) {
      console.error("Error al actualizar el stock de los productos:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length != 0) {
      setIsPurchaseModalOpen(true);
    } else {
      addAlert(
        'error',
        'No tiene productos seleccionados',
        'Porfavor seleccione un producto'
      );
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
      const productsCollection = collection(Db, 'Pedidos');
      const docRef = await addDoc(productsCollection, product);
      const generatedId = docRef.id;
      await updateDoc(docRef, { id: generatedId });
      clearCart();
    } catch (error) {
      console.error('Error al agregar el producto:', error);
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
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <AlertContainer alerts={alerts} onDismiss={removeAlert} />
      <PurchaseConfirmation
          product={deliveryInfo}
          cantidad={items.length}
          process={prossesPay}
          total={total}
          isOpen= {isPurchaseModalOpen}
          onConfirm={handleConfirmPurchase}
          onCancel={handleCancelPurchase}
        />
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
                        if (value <= item.stock) {
                          updateQuantity(item.id, value);
                        } else {
                          updateQuantity(item.id, item.stock); 
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
                      if (/^[a-zA-ZáéíóúÁÉÍÓÚ\s]*$/.test(newValue) && newValue.length <= 40) {
                        setDeliveryInfo({ ...deliveryInfo, name: newValue });
                      }
                    }}
                    onBlur={() => {
                      if (deliveryInfo.name.length < 3) {
                        setDeliveryInfo({ ...deliveryInfo, name: "" }); 
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
                      if (/^\d{0,10}$/.test(newValue)) {
                        setDeliveryInfo({ ...deliveryInfo, phone: newValue });
                      }
                    }}
                    onBlur={() => {
                      if (deliveryInfo.phone.length !== 10) {
                        setDeliveryInfo({ ...deliveryInfo, phone: "" }); 
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
                      let newValue = e.target.value.replace(/\D/g, ""); 
                      newValue = newValue.replace(/(\d{4})(?=\d)/g, "$1 "); 
                  
                      if (newValue.length <= 19) { 
                        setPaymentInfo({ ...paymentInfo, cardNumber: newValue });
                      }
                    }}
                    onBlur={() => {
                      const onlyDigits = paymentInfo.cardNumber.replace(/\s/g, ""); 
                      if (onlyDigits.length !== 16) {
                        setPaymentInfo({ ...paymentInfo, cardNumber: "" }); 
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
                        let newValue = e.target.value.replace(/\D/g, "");
                        if (newValue.length <= 4) {
                          if (newValue.length >= 3) {
                            newValue = newValue.slice(0, 2) + "/" + newValue.slice(2, 4); 
                          }
                          setPaymentInfo({ ...paymentInfo, expiryDate: newValue });
                        }
                      }}
                      onBlur={() => {
                        if (paymentInfo.expiryDate.length !== 5) {
                          setPaymentInfo({ ...paymentInfo, expiryDate: "" }); 
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
                        const newValue = e.target.value.replace(/\D/g, "");
                        if (newValue.length <= 3) {
                          setPaymentInfo({ ...paymentInfo, cvv: newValue });
                        }
                      }}
                      onBlur={() => {
                        if (paymentInfo.cvv.length !== 3) {
                          setPaymentInfo({ ...paymentInfo, cvv: "" }); 
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