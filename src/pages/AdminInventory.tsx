import React, { useEffect, useState } from "react";
import { format } from 'date-fns';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Db, auth } from '../Firebase';
import { ProductoInt } from '../Interfaces/InterfacesDeProfuctos';
import { Trash2, Pen, Save } from 'lucide-react';
import { parseISO } from 'date-fns';

export default function AdminInventory() {


  const [products, setProducts] = useState<ProductoInt[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  const [tempStock, setTempStock] = useState<number | null>(null);
  const [tempPrice, setTempPrice] = useState<number | null>(null);
  const [tempExpiry, setTempExpiry] = useState<string | null>(null);



  useEffect(() => {
    const fetchProducts = async () => {
      const productCollection = collection(Db, "productos");
      const productSnapshot = await getDocs(productCollection);

      const productsData: ProductoInt[] = productSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        category: doc.data().category,
        price: doc.data().price,
        description: doc.data().description,
        Imagen: doc.data().Imagen,
        stock: doc.data().stock,
        expiryDate: doc.data().expiryDate,
      }));

      setProducts(productsData);
    };

    fetchProducts();
  }, []);

  const handleSave = async (id: string) => {
    const productDoc = doc(Db, 'productos', id);

    if (tempStock !== null) await updateDoc(productDoc, { stock: tempStock });
    if (tempPrice !== null) await updateDoc(productDoc, { price: tempPrice });
    if (tempExpiry !== null) await updateDoc(productDoc, { expiryDate: tempExpiry });

    setProducts(products.map(p =>
      p.id === id ? {
        ...p, stock: tempStock !== null ? tempStock : p.stock,
        price: tempPrice !== null ? tempPrice : p.price,
        expiryDate: tempExpiry !== null ? tempExpiry : p.expiryDate
      } : p
    ));

    setEditingId(null);
    setTempStock(null);
    setTempPrice(null);
    setTempExpiry(null);
  };

  const handleDelete = async (id: string) => {
    const productDoc = doc(Db, 'productos', id);
    await deleteDoc(productDoc);
    setProducts(products.filter(product => product.id !== id));
  };

  const filteredProducts = products.filter(product => {
    if (filter === 'low-stock') return product.stock < 10;
    if (filter === 'expiring-soon') {
      const daysUntilExpiry = Math.ceil(
        (new Date(product.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilExpiry <= 10;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Administracion de Inventario</h1>
        <div className="flex space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-2 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          >
            <option value="all">Todos los productos</option>
            <option value="low-stock">Bajo Stock</option>
            <option value="expiring-soon">Expiran Pronto</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="bg-gray-50 min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Expiracion
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>

            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === product.id ? (
                    <input
                      type="number"
                      defaultValue={product.stock}
                      min="1"
                      max="999"
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10);
                        if (value <= 999 && value >= 0) {
                          setTempStock(value);
                        }
                      }}
                      className="w-20 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">{product.stock}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === product.id ? (
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
                          setTempExpiry(today); 
                        } else {
                          setTempExpiry(selectedDate);
                        }
                      }}
                      className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">
                      {format(parseISO(product.expiryDate), 'MMM dd, yyyy')}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === product.id ? (
                    <input
                      type="number"
                      defaultValue={product.price}
                      min="0.01"
                      max="9999"
                      step="0.01"
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (value <= 9999 && value >= 0) {
                          setTempPrice(value);
                        }
                      }}
                      className="w-20 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">${product.price.toFixed(2)}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === product.id ? (
                    <button
                      onClick={() => handleSave(product.id)}
                      className="text-green-600 hover:text-green-900"
                    >
                      <Save className="mr-1" />
                    </button>
                  ) : (
                    <div>
                      <button
                        onClick={() => {
                          setEditingId(product.id);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-6"
                      >
                        <Pen className="mr-1" />
                      </button>
                      <button
                        onClick={() => {
                          alert(`Producto eliminado: ${product.name}`), handleDelete(product.id)
                        }}
                        className="text-red-600 hover:text-red-900mr-6"
                      >
                        <Trash2 className="mr-1" />
                      </button>
                    </div>

                  )}


                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}