import React, { useState, useEffect, useRef } from "react";
import ProductCard, { type ProductDTO } from "./ProductCard";

const ChevronDown = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M5 7.5L10 12.5L15 7.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Dropdown = ({
  options,
  value,
  placeholder = "Seleccionar",
  className = "min-h-[40px]",
  onChange,
}: {
  options: string[];
  value?: string;
  placeholder?: string;
  className?: string;
  onChange?: (value: string) => void;
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener("click", handleOutsideClick);
    } else {
      document.removeEventListener("click", handleOutsideClick);
    }

    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isVisible]);

  const handleOptionClick = (option: string) => {
    onChange?.(option);
    setIsVisible(false);
  };

  return (
    <div className={`relative w-44 ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsVisible(!isVisible)}
        className={`inline-flex w-full items-center justify-between rounded-md border border-gray-300 bg-white p-2.5 text-sm font-medium text-gray-700 outline-none hover:border-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 ${
          !options.length ? "cursor-not-allowed text-gray-400" : ""
        }`}
        aria-expanded={isVisible}
        aria-controls="dropdown-menu"
        disabled={!options.length}
      >
        {value || placeholder}
        <span
          className={`transform transition-transform duration-200 ${
            isVisible ? "rotate-180" : ""
          }`}
        >
          <ChevronDown size={20} />
        </span>
      </button>

      {isVisible && options.length > 0 ? (
        <ul
          id="dropdown-menu"
          role="menu"
          className="absolute z-50 mt-2 w-full rounded-md border border-gray-200 bg-white shadow-lg overflow-hidden"
        >
          {options.map((option) => (
            <li key={option}>
              <button
                role="menuitem"
                tabIndex={0}
                aria-selected={value === option}
                onClick={() => handleOptionClick(option)}
                className="w-full cursor-pointer px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 focus:bg-orange-100 focus:text-orange-700 focus:outline-none"
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        isVisible && (
          <div className="absolute z-50 mt-2 w-full rounded-md border border-gray-200 bg-white p-3 text-sm text-gray-500">
            No options available
          </div>
        )
      )}
    </div>
  );
};

export default function CatalogApp() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [combustible, setCombustible] = useState("Todos");
  const [orden, setOrden] = useState("Menor a Mayor");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [combustible, orden, page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Llamada real al backend (Comentada para cuando levantes tu API):
      // const url = `http://tu-api-url.com/api/v1/grupos-electrogenos/filtro/combustible?tipo=${combustible}&page=${page}&size=12`;
      // const res = await fetch(url);
      // const data = await res.json();

      // Datos Mockeados para visualizar el frontend mientras tanto:
      await new Promise((resolve) => setTimeout(resolve, 1200)); // Simula latencia para ver los skeletons

      // Simulamos que "Todos" tiene 18 productos (3 páginas) y los filtros específicos 6 productos (1 página)
      const totalItems = combustible === "Todos" ? 18 : 6;
      const calculatedTotalPages = Math.ceil(totalItems / 6);
      setTotalPages(calculatedTotalPages);

      // Calculamos cuántos ítems se deben renderizar en la página actual (máximo 6)
      const currentItemsCount = Math.max(0, Math.min(6, totalItems - page * 6));

      const mockData: ProductDTO[] = Array.from({
        length: currentItemsCount,
      }).map((_, i) => {
        const globalIndex = page * 6 + i;
        const tipoCombustible =
          combustible === "Todos"
            ? ["Nafta", "Gasoil", "Gas Natural"][globalIndex % 3]
            : combustible;

        return {
          id: globalIndex,
          modelo: `Generador ${tipoCombustible} Auto X-${Math.floor(Math.random() * 1000)}`,
          combustible: tipoCombustible,
          potenciaContinua: `${50 + globalIndex * 10} kVA`,
          potenciaEmergencia: `${55 + globalIndex * 10} kVA`,
          precioVentaCalculado: 2500000 + Math.floor(Math.random() * 1500000),
        };
      });

      // Ordenamiento Dinámico
      if (orden === "Menor a Mayor") {
        mockData.sort(
          (a, b) => a.precioVentaCalculado - b.precioVentaCalculado,
        );
      } else if (orden === "Mayor a Menor") {
        mockData.sort(
          (a, b) => b.precioVentaCalculado - a.precioVentaCalculado,
        );
      }

      setProducts(mockData);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => setPage((p) => p + 1);
  const handlePrevPage = () => setPage((p) => Math.max(0, p - 1));

  return (
    <div className="w-full">
      {/* Componente Lógico de Filtros (CatalogFilter) */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-gray-50 p-5 rounded-2xl mb-8 gap-4 border border-gray-200 shadow-sm relative">
        <div className="flex items-center gap-3 w-full md:w-auto z-20">
          <label className="font-semibold text-gray-700 whitespace-nowrap">
            Combustible:
          </label>
          <Dropdown
            options={["Todos", "Nafta", "Gasoil", "Gas Natural"]}
            value={combustible}
            className="w-full md:w-48"
            onChange={(val) => {
              setCombustible(val);
              setPage(0);
            }}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto z-10">
          <label className="font-semibold text-gray-700 whitespace-nowrap">
            Ordenar por:
          </label>
          <Dropdown
            options={["Menor a Mayor", "Mayor a Menor"]}
            value={orden}
            className="w-full md:w-48"
            onChange={(val) => {
              setOrden(val);
              setPage(0);
            }}
          />
        </div>
      </div>

      {/* Cuadrícula de Productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? // Skeleton Loaders
            Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse"
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
