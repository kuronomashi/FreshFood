import React, { useEffect, useState } from 'react';

// Array de URLs de imágenes que se mostrarán en el carrusel
const images = [  
  'https://c4.wallpaperflare.com/wallpaper/64/34/361/arbol-fruta-naturaleza-pera-wallpaper-preview.jpg',
  'https://w.wallhaven.cc/full/qd/wallhaven-qdl3kr.jpg',
  'https://www.dependenciasocialmedia.com/wp-content/uploads/2015/07/fruits-and-veggies-1920x1200-wallpaper-frutas-vegetales-collage.jpg',
  'https://w.wallhaven.cc/full/ne/wallhaven-nek52k.jpg',
  'https://c4.wallpaperflare.com/wallpaper/786/875/758/frutas-melocotones-naturaleza-rojos-wallpaper-preview.jpg'
];

// Componente principal del carrusel de fondo
export default function BackgroundCarousel() {
  // Estado para controlar el índice de la imagen actual
  // Iniciamos con un valor negativo para crear el efecto de ciclo infinito
  const [currentIndex, setCurrentIndex] = useState(-(images.length - 1));

  // Efecto que maneja la transición automática de las imágenes
  useEffect(() => {
    // Configuramos un temporizador que se ejecuta cada x segundos
    const timer = setInterval(() => {
      setCurrentIndex((current) => {
        // Si llegamos al final del ciclo (índice 0 o mayor)
        // reiniciamos al inicio del ciclo con el valor negativo máximo
        if (current >= 0) {
          return -(images.length - 1);
        }
        // Si no, incrementamos el índice en 1
        return current + 1;
      });
    }, 4000);
    
    // Limpiamos el temporizador cuando el componente se desmonta
    return () => clearInterval(timer);
  }, []);

  // Renderizado del componente
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div 
        className="flex transition-transform duration-1000 ease-in-out h-full"
        style={{ 
          transform: `translateX(${currentIndex * 100}%)`,
          width: `${images.length * 30}%`
        }}
      > {images.map((image, index) => (
          <div
            key={index}
            className="relative w-full h-full flex-shrink-0"
          >
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
          </div>
        ))}
      </div>
    </div>
  );
}