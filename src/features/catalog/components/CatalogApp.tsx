import React, { useState, useEffect } from "react";
import ProductCard, { type ProductDTO } from "./ProductCard";
import { listGruposByCombustible } from "../api/catalogApi";
import type { GrupoElectrogenoDTO } from "../../inventory/types";
import Dropdown from "../../../components/react/Dropdown";

export default function CatalogApp() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [combustible, setCombustible] = useState("Todos");
  const [orden, setOrden] = useState("Menor a Mayor");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const PAGE_SIZE = 6;

  const mapToProduct = (grupo: GrupoElectrogenoDTO): ProductDTO => {
    const combustibleLabel = grupo.tipoCombustible
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return {
      id: grupo.id,
      modelo: grupo.codigo,
      combustible: combustibleLabel,
      potenciaContinua: `${grupo.pMin} kVA`,
      potenciaEmergencia: `${grupo.pMax} kVA`,
      precioVentaCalculado: Number(grupo.precioVentaCalculado || 0),
      imageUrl: grupo.imageUrl,
    };
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const tipos =
        combustible === "Todos"
          ? ["NAFTA", "GASOIL", "GAS_NATURAL"]
          : [combustible];
      const sizePerTipo =
        tipos.length > 1
          ? Math.max(1, Math.ceil(PAGE_SIZE / tipos.length))
          : PAGE_SIZE;

      const responses = await Promise.all(
        tipos.map((tipo) =>
          listGruposByCombustible(tipo, page, sizePerTipo),
        ),
      );

      const merged = responses.flatMap((response) =>
        response.content.map(mapToProduct),
      );

      const sorted = [...merged].sort((a, b) => {
        if (orden === "Menor a Mayor") {
          return a.precioVentaCalculado - b.precioVentaCalculado;
        }
        if (orden === "Mayor a Menor") {
          return b.precioVentaCalculado - a.precioVentaCalculado;
        }
        return 0;
      });

      const limited = tipos.length > 1 ? sorted.slice(0, PAGE_SIZE) : sorted;
      setProducts(limited);

      const calculatedTotalPages = Math.max(
        1,
        ...responses.map((response) => response.totalPages ?? 1),
      );
      setTotalPages(calculatedTotalPages);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al cargar productos";
      console.error("Error al cargar productos:", err);
      setError(message);
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [combustible, orden, page]);

  useEffect(() => {
    const handler = () => {
      fetchProducts();
    };
    window.addEventListener("stock-updated", handler);
    return () => window.removeEventListener("stock-updated", handler);
  }, [combustible, orden, page]);

  const handleNextPage = () => setPage((p) => p + 1);
  const handlePrevPage = () => setPage((p) => Math.max(0, p - 1));

  return (
    <div className="w-full">
      {/* Componente Lógico de Filtros (CatalogFilter) */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-gray-50 p-5 rounded-2xl mb-8 gap-4 border border-gray-200 shadow-sm relative">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="font-semibold text-gray-700 whitespace-nowrap">
            Combustible:
          </label>
          <Dropdown
            options={[
              { label: "Todos", value: "Todos" },
              { label: "Nafta", value: "NAFTA" },
              { label: "Gasoil", value: "GASOIL" },
              { label: "Gas Natural", value: "GAS_NATURAL" },
            ]}
            value={combustible}
            className="min-h-10 w-full md:w-48"
            onChange={(val) => {
              setCombustible(val);
              setPage(0);
            }}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="font-semibold text-gray-700 whitespace-nowrap">
            Ordenar por:
          </label>
          <Dropdown
            options={[
              { label: "Menor a Mayor", value: "Menor a Mayor" },
              { label: "Mayor a Menor", value: "Mayor a Menor" },
            ]}
            value={orden}
            className="min-h-10 w-full md:w-48"
            onChange={(val) => {
              setOrden(val);
              setPage(0);
            }}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
          {error}
        </div>
      )}

      {/* Cuadrícula de Productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? // Skeleton Loaders
            Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse motion-reduce:animate-none"
              >
                <div className="w-full h-40 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-5 bg-gray-200 rounded-full w-1/4 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-6"></div>
                <div className="space-y-3 mb-6">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mt-auto"></div>
              </div>
            ))
          : products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>

      {/* Paginación */}
      <div className="flex justify-center items-center mt-12 gap-6">
        <button
          onClick={handlePrevPage}
          disabled={page === 0 || loading}
          className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Anterior
        </button>
        <span className="text-gray-600 font-medium">Página {page + 1}</span>
        <button
          onClick={handleNextPage}
          disabled={loading || page >= totalPages - 1}
          className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
