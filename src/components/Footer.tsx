import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-green-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        <div className="flex flex-col justify-center">
            <h3 className="font-semibold font-mitr text-4xl font-semibold mb-4">Fresh Food</h3>
          </div>
          <div>
            <h3 className="font-semibold font-commissioner text-lg font-semibold mb-4">Contactanos</h3>
            <div className="font-commissioner space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5" />
                <span>3133696176</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>freshfooducol@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Cra. 79 #42 B, Bogotá</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold font-commissioner text-lg font-semibold mb-4">Horario</h3>
            <div className="font-commissioner space-y-2">
              <p>Lunes - Viernes: 8:00 AM - 6:00 PM</p>
              <p>Sabados: 9:00 AM - 4:00 PM</p>
              <p>Domingo: Cerrado</p>
            </div>
          </div>

          
        </div>

        <div className="mt-8 pt-8 border-t border-green-700">
          <p className="text-center text-sm">
            © {new Date().getFullYear()} Fresh Foods Distribution. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}