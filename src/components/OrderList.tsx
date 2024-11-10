import React from 'react';
import { ChevronRight, Package } from 'lucide-react';
import { Pedidos } from '../Interfaces/InterfacesDeProfuctos';

interface OrderListProps {
  orders: Pedidos[];
  selectedOrderId: string | null;
  onSelectOrder: (orderId: string) => void;
}

export default function OrderList({ orders, selectedOrderId, onSelectOrder }: OrderListProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="font-mitr font-semibold text-2xl text-gray-800 mb-6">Pedidos</h2>
      <div className="space-y-4">
        {orders.map((order) => (
          <button
            key={order.id}
            onClick={() => onSelectOrder(order.id)}
            className={`w-full text-left p-4 rounded-lg transition-colors ${
              selectedOrderId === order.id
                ? 'bg-emerald-100 hover:bg-emerald-200'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Package className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">{order.name}</h3>
                  <p className="text-sm text-gray-500">
                    {order.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}