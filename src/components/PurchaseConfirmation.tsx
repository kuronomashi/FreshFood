import React from 'react';
import { ShoppingCart, CreditCard, X } from 'lucide-react';
import { Pedidos, ProductoInt } from '../Interfaces/InterfacesDeProfuctos';

interface PurchaseConfirmationProps {
  product: Pedidos;
  total: Number;
  cantidad: Number;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
  process: boolean;
}

// Componente principal para la confirmación de compra
export const PurchaseConfirmation: React.FC<PurchaseConfirmationProps> = ({
  product,
  total,
  cantidad,
  onConfirm,
  onCancel,
  isOpen,
  process
}) => {
  // Si el modal no está abierto, no renderizamos nada
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Encabezado del modal */}
          <div className="bg-green-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6" />
                <h3 className="text-lg font-semibold">Confirmar Compra</h3>
              </div>
              <button
                onClick={onCancel}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Contenido del modal */}
          <div className="p-6">
            <div className="space-y-4">
              {/* Detalles del producto */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Detalles de la compra</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Nombre del destinatario: <span className="font-medium text-gray-900">{product.name}</span></p>
                  <p>Cantidad productos: <span className="font-medium text-gray-900">{cantidad.toFixed(0)}</span></p>
                  <p>Precio total: <span className="font-medium text-gray-900">${total.toFixed(2)}</span></p>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center border-t pt-4">
                <span className="text-lg font-medium text-gray-900">Total a pagar:</span>
                <span className="text-2xl font-bold text-green-600">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          
          {/* Botones de acción */}
          {!process && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                Confirmar Compra
              </button>
            </div>
            )}
          
        </div>
      </div>
    </div>
  );
};