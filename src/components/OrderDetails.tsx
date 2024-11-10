import { Package, ShoppingCart, User, Phone, Mail, MapPin, Trash, Save } from 'lucide-react';
import { Pedidos } from '../Interfaces/InterfacesDeProfuctos';
import PdfGenrate from '../components/PdfOrder';
import { pdf } from '@react-pdf/renderer';


interface OrderDetailsProps {
    order: Pedidos;
    onDeleteOrder: (id: string) => void;
}

export default function OrderDetails({ order ,onDeleteOrder}: OrderDetailsProps) {
    const totalItems = order.productos.reduce((acc, item) => acc + item.quantity, 0);
    const totalAmount = order.productos.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleDelete = async () => {
        await onDeleteOrder(order.id); // Llama la función de `AdminInventory`
      };

    const CrearPdf = async () => {
        const blob = await pdf(<PdfGenrate Order={order} CarInfo={order.productos} id={order.id}/>).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Resumen de Factura (${order.id}).pdf`;
        link.click();
        URL.revokeObjectURL(url); // Limpiar la URL después de la descarga
      };

    return (
        <div className="space-y-8">
            {/* Customer Information Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className='flex justify-between items-center'>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Detalles del Comprador</h2>
                    <div className="flex ml-auto">
                        <button
                            onClick={() => { CrearPdf()}}
                            className="text-green-600 hover:text-green-900 mr-4 transform transition-transform duration-200 hover:scale-110"
                        >
                            <Save className="mr-1" />
                        </button>
                        <button
                            onClick={handleDelete}
                            className="text-red-600 hover:text-red-900 mr-6 transform transition-transform duration-200 hover:scale-110"
                        >
                            <Trash className="mr-1" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex items-center space-x-3 mr-2">
                        <div>
                            <User className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="w-full">
                            <p className="text-sm text-gray-500">Nombre</p>
                            <p className="font-medium break-words">{order.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 mr-4">
                        <div>
                            <Mail className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="w-full">
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium truncate hover:overflow-visible hover:whitespace-normal hover:break-words">
                                {order.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 mr-2">
                        <Phone className="w-5 h-5 text-emerald-600" />  
                        <div>
                            <p className="text-sm text-gray-500">Telefono</p>
                            <p className="font-medium">{order.phone}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 mr-2">
                        <MapPin className="w-5 h-5 text-emerald-600" />
                        <div className="w-full">
                            <p className="text-sm text-gray-500">Direccion</p>
                            <p className="font-medium truncate hover:overflow-visible hover:whitespace-normal hover:break-words">{order.address}</p>
                        </div>
                    </div>

                </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Lista de productos</h2>
                    <div className="flex items-center space-x-2">
                        <ShoppingCart className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-medium text-gray-600">{totalItems} Productos</span>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 gap-6">
                    {order.productos.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <Package className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-800">{item.name}</h3>
                                    <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-medium text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
                                <p className="text-sm text-gray-500">${item.price.toFixed(2)} Precio</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Total */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-lg font-semibold text-gray-800">Importe total</p>
                            <p className="text-sm text-gray-500">Incluyendo todos los artículos</p>
                        </div>
                        <p className="text-2xl font-bold text-emerald-600">${totalAmount.toFixed(2)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}