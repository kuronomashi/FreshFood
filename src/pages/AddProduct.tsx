import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { collection, addDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { Db } from '../Firebase';
import { ProductoInt } from '../Interfaces/InterfacesDeProfuctos';
import { AlertType } from '../components/Alert';
import { AlertContainer } from '../components/AlertContainer';
import { ConfirmationAlert } from '../components/ConfirmationAlert';


interface AlertItem {
  id: string;
  type: AlertType;
  title: string;
  message: string;
}

export default function AddProduct() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductoInt>({
    id: '',
    name: '',
    category: '',
    description: '',
    price: 0,
    stock: 0,
    expiryDate: '',
    Imagen: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPurchaseModalOpen(true)
  };

  const AdicionProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productsCollection = collection(Db, 'productos');
      const querySnapshot = await getDocs(productsCollection);
      const nameExists = querySnapshot.docs.some(doc =>
        doc.data().name.toLowerCase() == product.name.toLowerCase()
      );
      if (nameExists) {
        addAlert(
          'error',
          'El producto ya existe',
          'Comprueba que el producto no tenga el mismo nombre que otro'
        );
        return;
      }
      const docRef = await addDoc(productsCollection, product);
      const generatedId = docRef.id;
      await updateDoc(docRef, { id: generatedId });
      addAlert(
        'success',
        'Agregamos el producto',
        'Se agrego el producto exitosamente, vuelve mas tarde si se te olvido alguno'
      );
    } catch (error) {
      console.error('Error al agregar el producto:', error);
      alert('Hubo un error al agregar el producto.');
    }
  };

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

  const handleConfirmPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPurchaseModalOpen(false)
    AdicionProducto(e);
  };
  const handleCancelPurchase = () => {
    setIsPurchaseModalOpen(false);
    addAlert(
      'info',
      'Adicion Cancelada',
      'Revisa los datos y vuelve a intentarlo'
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <AlertContainer alerts={alerts} onDismiss={removeAlert} />
      <ConfirmationAlert
        title="Añadir Producto"
        message="Estas seguro de añadir este producto?"
        isOpen={isPurchaseModalOpen}
        onConfirm={handleConfirmPurchase}
        onCancel={handleCancelPurchase}
      />
      <button
        onClick={() => navigate('/admin')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Volver
      </button>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Añade nuevo producto</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del producto
              </label>
              <input
                type="text"
                required
                value={product.name || ''}
                onChange={(e) => {
                  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
                  const value = e.target.value.trimStart();
                  if (regex.test(value) && value.length <= 30) {
                    setProduct({ ...product, name: value });
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                required
                value={product.category || ''}
                onChange={(e) => setProduct({ ...product, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Categoria</option>
                <option value="Frutas">Frutas</option>
                <option value="Vegetales">Vegetales</option>
                <option value="Otros">Otro</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                required
                value={product.description || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/^\s+/, '');
                  if (value.length <= 100) {
                    setProduct({ ...product, description: value });
                  }
                }}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio ($)
              </label>
              <input
                type="number"
                required
                value={product.price}
                min="0.01"
                max="9999"
                step="0.01"
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setProduct({ ...product, price: value });
                }}
                onBlur={() => {
                  if (product.price <= 0) {
                    setProduct({ ...product, price: 0.01 });
                  } else if (product.price > 9999) {
                    setProduct({ ...product, price: 9999 });
                  }
                }}

                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad Stock
              </label>
              <input
                type="number"
                required
                value={product.stock}
                min="1"
                max="999"
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setProduct({ ...product, stock: value });
                }}
                onBlur={() => {
                  if (product.stock <= 0) {
                    setProduct({ ...product, stock: 1 });
                  } else if (product.stock > 999) {
                    setProduct({ ...product, stock: 999 });
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Expiracion
              </label>
              <input
                type="date"
                defaultValue={product.expiryDate}
                min={new Date().toISOString().split('T')[0]}
                max={new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0]}
                onChange={(e) => {
                  const selectedDate = e.target.value;
                  const today = new Date().toISOString().split('T')[0];
                  const maxDate = new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0];
                  if (selectedDate < today || selectedDate > maxDate) {
                    console.log("Fecha fuera de rango");
                  } else {
                    setProduct({ ...product, expiryDate: selectedDate });
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagen Url
              </label>
              <div className="flex">
                <input
                  type="url"
                  required
                  value={product.Imagen}
                  onChange={(e) => setProduct({ ...product, Imagen: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </div>

          {product.Imagen && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Image Preview</p>
              <img
                src={product.Imagen}
                alt="Product preview"
                className="w-32 h-32 object-cover rounded-lg border border-gray-300"
              />
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="font-bold px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Añadir Producto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}