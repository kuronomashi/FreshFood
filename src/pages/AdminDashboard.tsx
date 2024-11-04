import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, AlertTriangle, Plus, Key } from 'lucide-react';
import { collection, getDocs } from "firebase/firestore";
import { Db, auth } from '../Firebase';
import { ProductoInt } from '../Interfaces/InterfacesDeProfuctos';

export default function AdminDashboard() {
  const [totalProducts, setTotalProducts] = useState(0);
  const [products, setProducts] = useState<ProductoInt[]>([]);
  const lowStockProducts = products.filter(producto => producto.stock < 10);
  const expiringSoonProducts = products.filter(producto => {
    const expirationDate = new Date(producto.expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysLeft = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 10;
  });
  useEffect(() => {
    const fetchProductData = async () => {
      const productCollection = collection(Db, "productos");
      const productSnapshot = await getDocs(productCollection);
      const productList: ProductoInt[] = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductoInt));
      setProducts(productList);
      const total = productSnapshot.size;
      setTotalProducts(total);
    };

    fetchProductData();
  }, []);

  const stats = [
    { label: 'Total de los productos', value: totalProducts, icon: Package },
    { label: 'Low Stock Items', value: lowStockProducts.length, icon: ShoppingBag },
    { label: 'Expiring Soon', value: expiringSoonProducts.length, icon: AlertTriangle }
  ];


  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center space-x-2 font-bold">
        <Link
          to="/admin/inventory"
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          <Key className="h-5 w-5" />
          <span>Admin Inventory</span>
        </Link>
        <Link
          to="/admin/products/new"
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          <Plus className="h-5 w-5" />
          <span>Add New Product</span>
        </Link>
        </div>
        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <Icon className="h-8 w-8 text-green-600" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Low Stock Alerts</h2>
          <div className="space-y-4">
            <div className="space-y-4">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map(producto => (
                  <div key={producto.id} className={`flex items-center justify-between p-4 ${producto.stock < 5 ? 'bg-red-50' : 'bg-yellow-50'} rounded-md`}>
                    <div>
                      <h3 className="font-medium">{producto.name}</h3>
                      <p className="text-sm text-gray-600">Only {producto.stock} units remaining</p>
                    </div>
                    <Link
                      to="/admin/inventory"
                      className={`text-${producto.stock < 5 ? 'red' : 'yellow'}-600 hover:text-${producto.stock < 5 ? 'red' : 'yellow'}-800`}
                    >
                      Update Stock
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No low stock products available.</p>
              )}
            </div>

          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Expiring Products</h2>
          <div className="space-y-4">
            {expiringSoonProducts.length > 0 ? (
              expiringSoonProducts.map(producto => {
                const expirationDate = new Date(producto.expiryDate);
                const daysLeft = Math.ceil((expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                console.log("Days Left:", daysLeft);
                return (
                  <div key={producto.id} className={`flex items-center justify-between p-4 ${producto.stock < 5 ? 'bg-red-50' : 'bg-orange-50'} rounded-md`}>
                    <div>
                      <h3 className="font-medium">{producto.name}</h3>
                      <p className="text-sm text-gray-600">
                        {daysLeft < 0 ? 'Expired' : daysLeft === 0 ? 'Expires Today' : `Expires in ${daysLeft} days`}
                      </p>
                    </div>
                    <Link
                      to="/admin/inventory"
                      className={`text-${daysLeft < 5 ? 'red' : 'orange'}-600 hover:text-${daysLeft < 5 ? 'red' : 'orange'}-800`}
                    >
                      Mark as Sold
                    </Link>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-600">No expiring products available.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}