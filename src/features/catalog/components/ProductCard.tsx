import React from "react";
import { formatPEN } from "../../../lib/format";

export interface ProductDTO {
  id: number;
  modelo: string;
  combustible: string;
  potenciaContinua: string;
  potenciaEmergencia: string;
  precioVentaCalculado: number;
  imageUrl?: string;
}

export default function ProductCard({ product }: { product: ProductDTO }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-lg hover:-translate-y-1">
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.modelo}
          className="h-40 w-full rounded-lg mb-4 object-cover"
          loading="lazy"
        />
      ) : (
        <div className="h-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
          <span className="text-gray-400 font-medium">Imagen del Equipo</span>
        </div>
      )}

      <div className="mb-3">
        <span className="text-xs font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
          {product.combustible}
        </span>
      </div>

      <h3
        className="text-xl font-bold text-gray-900 mb-4 truncate"
        title={product.modelo}
      >
        {product.modelo}
      </h3>

      <div className="space-y-3 mb-6">
        <div className="flex items-center text-sm text-gray-600">
          <svg
            className="w-5 h-5 text-gray-400 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span>
            Potencia Continua:{" "}
            <strong className="text-gray-900">
              {product.potenciaContinua}
            </strong>
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <svg
            className="w-5 h-5 text-gray-400 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            Potencia Emergencia:{" "}
            <strong className="text-gray-900">
              {product.potenciaEmergencia}
            </strong>
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <span className="block text-sm text-gray-500 mb-1">
          Precio estimado
        </span>
        <span className="text-2xl font-black text-blue-950">
          {formatPEN(product.precioVentaCalculado)}
        </span>
      </div>
    </div>
  );
}
