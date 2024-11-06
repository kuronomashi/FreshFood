
export interface ProductoInt {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  Imagen: string;
  stock:number;
  expiryDate:string;
}

export interface ProductoSinID {
  name: string;
  category: string;
  price: number;
  description: string;
  Imagen: string;
  stock:number;
  expiryDate:string;
}


interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Pedidos{
  id:string;
  name: string;
  email: string;
  phone: string;
  address: string;
  productos: CartItem[]
  date: string;
}