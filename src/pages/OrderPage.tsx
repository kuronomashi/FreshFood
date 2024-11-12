import React, { useState, useRef, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { pdf } from '@react-pdf/renderer';
import PdfGenrate from '../components/PdfOrder';
import { Pedidos, ProductoInt, InfCliente } from '../Interfaces/InterfacesDeProfuctos';
import { collection, addDoc, updateDoc, getDoc, doc,setDoc, } from 'firebase/firestore';
import { Db, auth } from '../Firebase';
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

export default function OrderPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductoInt[]>([]);
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();
  const [initialLoad, setInitialLoad] = useState(true);

  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [prossesPay, setBotonDeCompra] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [Efectuado, setEfectuado] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState<Pedidos>({
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    productos: [],
    date: ''
  });
  const [InfoCliente, setInfoCLiente] = useState<InfCliente>({
    name: '',
    phone: '',
    address: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  useEffect(() => {
    if (!isSaving) {
      const savedDeliveryInfo = localStorage.getItem("InfoUsuario");
      if (savedDeliveryInfo) {
        setInfoCLiente(JSON.parse(savedDeliveryInfo));
        setIsSaving(true);
        console.log("Hay datos locales")
      } else {
        CardatosDeFirebase();
      }
    }
  }, [isSaving]);

  const CardatosDeFirebase = async () => {
    const user = auth.currentUser;

    if (user) {
      const userRef = doc(Db, "AuthInfomation", user.uid);
  
      try {
        const docSnap = await getDoc(userRef);
        
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setInfoCLiente({
            name: userData.InfoCliente.name || '',
            phone: userData.InfoCliente.phone || '',
            address: userData.InfoCliente.address || '',
            cardNumber: userData.InfoCliente.cardNumber || '',
            expiryDate: userData.InfoCliente.expiryDate || '',
            cvv: userData.InfoCliente.cvv || '',
          });
          console.log("Se cargaron los datos");
          setIsSaving(true);
        } else {
          setIsSaving(true);
          console.log("No se encontraron los datos");
        }
      } catch (error) {
        console.error("Error al obtener los datos de Firebase:", error);
      }
    } else {
      console.log("No hay un usuario logueado");
      setIsSaving(true);
    }
  };

  useEffect(() => {
    if (isSaving) {
      localStorage.setItem("InfoUsuario", JSON.stringify(InfoCliente));
      console.log("Se guardo de maner local");
    }
  }, [InfoCliente]);

  const saveUserDataToFirebase = async () => {
    if (Efectuado) return;
    setEfectuado(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(Db, "AuthInfomation", user.uid);

        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const docData = docSnap.data();

          if (JSON.stringify(docData.InfoCliente) != JSON.stringify(InfoCliente)) {
            await setDoc(userRef, {
              InfoCliente
            });
            console.log("Cambio Realizado en Db");
          }else{
            console.log("No hay cambios");
          }
        } else {
          await setDoc(userRef, {
            userId: user.uid,
            InfoCliente
          });
          console.log("Nuevo documento creado con éxito en Firebase");
        }
      }
    } catch (error) {
      console.error("Error al guardar o actualizar datos en Firebase:", error);
    } finally {
      setEfectuado(false);
    }
  };

  const GuardoIfousuarioFirebase = () => {
    const isPaymentInfoComplete = InfoCliente && Object.values(InfoCliente).every(value => value !== '');

    if (isPaymentInfoComplete) {
      saveUserDataToFirebase();
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
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
  const handleConfirmPurchase = () => {
    setBotonDeCompra(true)
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
            setBotonDeCompra(false);
            setIsPurchaseModalOpen(false);
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
      setIsPurchaseModalOpen(false);
      setBotonDeCompra(false);
      addAlert(
        'success',
        '¡Compra exitosa!',
        'Tu pedido ha sido procesado correctamente.'
      );
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
    deliveryInfo.name = InfoCliente.name;
    deliveryInfo.email = user.email;
    deliveryInfo.phone = InfoCliente.phone;
    deliveryInfo.address = InfoCliente.address;
    deliveryInfo.productos = items;
    console.log(deliveryInfo.productos)
    deliveryInfo.date = formattedDate + " - " + formattedTime;
    try {
      const productsCollection = collection(Db, 'Pedidos');
      const docRef = await addDoc(productsCollection, deliveryInfo);
      const generatedId = docRef.id;
      await updateDoc(docRef, { id: generatedId });
      clearCart();
      await CrearPdf(generatedId);
    } catch (error) {
      console.error('Error al agregar el producto:', error);
    }
  };

  const CrearPdf = async (id: string) => {
    const blob = await pdf(<PdfGenrate Order={deliveryInfo} CarInfo={items} id={id} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Resumen de Factura (${id}).pdf`;
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
        isOpen={isPurchaseModalOpen}
        onConfirm={handleConfirmPurchase}
        onCancel={handleCancelPurchase}
      />
      <h1 className="font-mitr font-semibold text-3xl  mb-8">Tu Orden</h1>

      <div className="font-commissioner grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                    <p className="text-gray-600">${item.price}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      min="0"
                      max={item.stock}
                      step="1"
                      value={item.quantity}
                      onChange={(e) => {
                        let value = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                        if (value !== '' && typeof value === 'number' && value > item.stock) {
                          value = item.stock; // Limita el valor al stock máximo si es mayor
                        }
                        updateQuantity(item.id, value as number); // Solo llama a la función si `value` es un número

                      }}
                      onBlur={(e) => {
                        const value = parseInt(e.target.value, 10);
                        if (isNaN(value) || value < 1) {
                          updateQuantity(item.id, 1);
                        } else if (value > item.stock) {
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
                    value={InfoCliente.name}
                    onChange={(e) => {
                      const newValue = e.target.value.replace(/^\s+/, '');
                      if (/^[a-zA-ZáéíóúÁÉÍÓÚ\s]*$/.test(newValue) && newValue.length <= 40) {
                        setInfoCLiente({ ...InfoCliente, name: newValue });
                      }
                    }}
                    onBlur={() => {
                      if (InfoCliente.name.length < 3) {
                        setInfoCLiente({ ...InfoCliente, name: "" });
                      } else {
                        GuardoIfousuarioFirebase();
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
                    value={InfoCliente.phone}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      if (/^\d{0,10}$/.test(newValue)) {
                        setInfoCLiente({ ...InfoCliente, phone: newValue });
                      }
                    }}
                    onBlur={() => {
                      if (InfoCliente.phone.length !== 10) {
                        setInfoCLiente({ ...InfoCliente, phone: "" });
                      } else {
                        GuardoIfousuarioFirebase();
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
                    value={InfoCliente.address}
                    onChange={(e) => {
                      const newValue = e.target.value.replace(/^\s+/, '');
                      if (/^[a-zA-Z0-9\s.,#-]*$/.test(newValue) && newValue.length <= 25) {
                        setInfoCLiente({ ...InfoCliente, address: newValue });
                      }
                    }}
                    onBlur={() => {
                      GuardoIfousuarioFirebase();
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
                    value={InfoCliente.cardNumber}
                    onChange={(e) => {
                      let newValue = e.target.value.replace(/\D/g, "");
                      newValue = newValue.replace(/(\d{4})(?=\d)/g, "$1 ");

                      if (newValue.length <= 19) {
                        setInfoCLiente({ ...InfoCliente, cardNumber: newValue });
                      }
                    }}
                    onBlur={() => {
                      const onlyDigits = InfoCliente.cardNumber.replace(/\s/g, "");
                      if (onlyDigits.length !== 16) {
                        setInfoCLiente({ ...InfoCliente, cardNumber: "" });
                      } else {
                        GuardoIfousuarioFirebase();
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
                      value={InfoCliente.expiryDate}
                      onChange={(e) => {
                        let newValue = e.target.value.replace(/\D/g, "");
                        if (newValue.length <= 4) {
                          newValue = newValue.slice(0, 2) + (newValue.length > 2 ? "/" + newValue.slice(2, 4) : "");

                          setInfoCLiente({ ...InfoCliente, expiryDate: newValue });
                        }
                      }}
                      onBlur={() => {
                        const [month, year] = InfoCliente.expiryDate.split("/");
                        if (
                          !month ||
                          !year ||
                          parseInt(month) < 1 ||
                          parseInt(month) > 12 ||
                          month === "00" ||
                          parseInt(year) < 1 ||
                          parseInt(year) > 99
                        ) {
                          setInfoCLiente({ ...InfoCliente, expiryDate: "" });
                        } else {
                          GuardoIfousuarioFirebase();
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
                      value={InfoCliente.cvv}
                      onChange={(e) => {
                        const newValue = e.target.value.replace(/\D/g, "");
                        if (newValue.length <= 3) {
                          setInfoCLiente({ ...InfoCliente, cvv: newValue });
                        }
                      }}
                      onBlur={() => {
                        if (InfoCliente.cvv.length !== 3) {
                          setInfoCLiente({ ...InfoCliente, cvv: "" });
                        } else {
                          GuardoIfousuarioFirebase();
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