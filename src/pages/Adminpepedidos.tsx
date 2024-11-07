import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Db, auth } from '../Firebase';
import { Link } from 'react-router-dom';
import { Pedidos } from '../Interfaces/InterfacesDeProfuctos';
import OrderList from '../components/OrderList';
import OrderDetails from '../components/OrderDetails';
import { Trash2 ,ArrowLeftIcon} from 'lucide-react';

export default function AdminInventory() {


  const [Pedid, setProducts] = useState<Pedidos[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const selectedOrder = Pedid.find(Pedidos => Pedidos.id === selectedOrderId);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const productCollection = collection(Db, "Pedidos");
        const productSnapshot = await getDocs(productCollection);
        const Pedioslist: Pedidos[] = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pedidos));
        setProducts(Pedioslist);
      } catch (error) {
        setError((error as Error).message);
      }
    };
    fetchPedidos();
  }, []);

  const handleDelete = async (id: string) => {
    const productDoc = doc(Db, 'Pedidos', id);
    await deleteDoc(productDoc);
    setProducts(Pedid.filter(product => product.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold">Admin Order</h1>
      <div className="flex items-center space-x-2 font-bold">
      <Link
          to = "/admin"
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transform transition-transform duration-200 hover:scale-105"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Volver al Dashboard</span>
        </Link> 
        </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order List */}
          <div className="lg:col-span-1">
            <OrderList
              orders={Pedid}
              selectedOrderId={selectedOrderId}
              onSelectOrder={setSelectedOrderId}
            />
          </div>

          {/* Order Details */}
          <div className="lg:col-span-2">
            {selectedOrder ? (
              <OrderDetails order={selectedOrder} />
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-center h-48">
                <p className="text-gray-500 text-lg">Select una orden para ver detalles</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}