// src/components/ProductList.tsx
import React, { useEffect, useState } from 'react';
import { Db} from '../Firebase';
import { collection, getDocs } from 'firebase/firestore';
import { ProductoInt } from '../Interfaces/InterfacesDeProfuctos';

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<ProductoInt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCollection = collection(Db, 'productos');
        const productSnapshot = await getDocs(productsCollection);
        const productList: ProductoInt[] = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductoInt));
        setProducts(productList);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
  if (error) return <div>Error: {error}</div>;
  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Product List</h2>
      <ul>
        {products.map(product => (
          <li key={product.id}>
            <h3>{product.name}</h3>
            <p>Category: {product.category}</p>
            <p>Price: ${product.price}</p>
            <img 
              src={product.Imagen}
              className="w-full h-auto" // Puedes ajustar la clase según tus necesidades
            />
            <p>Description: {product.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
 
};

export default ProductList;
