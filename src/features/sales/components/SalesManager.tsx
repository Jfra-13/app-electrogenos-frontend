import React, { useEffect, useMemo, useState } from "react";
import SalesForm from "./SalesForm";
import BoletaPreview from "./BoletaPreview";
import SuccessDialog from "./SuccessDialog";
import GruposPanel from "./GruposPanel";
import type { GrupoElectrogenoDTO } from "../../inventory/types";
import type {
  SolicitudCompraRequestDTO,
  SolicitudCompraResponseDTO,
  TipoPago,
} from "../types";
import type { ClienteDTO } from "../../clientes/types";
import { createVenta } from "../api/ventasApi";
import { ApiError } from "../../../lib/api/http";
import { isAdmin, isEmpleado } from "../../../lib/api/jwt";
import { notify, ToastViewport } from "../../../components/react/ui/Toast";

// Derived power for the chosen group: backend still validates potencia >= 1 and
// must match the group, so we send its midpoint (or potenciaMedia when present).
function potenciaDe(g: GrupoElectrogenoDTO): number {
  return g.potenciaMedia != null ? g.potenciaMedia : (g.pMin + g.pMax) / 2;
}

export default function SalesManager() {
  // Sale-in-progress state (lifted from the form per Model B).
  const [grupoElegido, setGrupoElegido] = useState<GrupoElectrogenoDTO | null>(
    null,
  );
  const [cliente, setCliente] = useState<ClienteDTO | null>(null);
  const [cantidad, setCantidad] = useState("1");
  const [tipoPago, setTipoPago] = useState<TipoPago>("CHEQUE");

  const [summary, setSummary] = useState<SolicitudCompraResponseDTO | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 409 = stock insuficiente; shown as a distinct danger block per spec §6.
  const [conflict, setConflict] = useState(false);

  // Sales are ADMIN or EMPLEADO. Only plain USER is blocked.
  const [canSell, setCanSell] = useState(false);
  useEffect(() => setCanSell(isAdmin() || isEmpleado()), []);

  const cantidadNum = Number(cantidad);
  const stock = grupoElegido?.stock ?? 0;

  // Pre-submit guard: blocks the 409 surprise before it reaches the backend.
  const canSubmit = useMemo(() => {
    if (!cliente || !grupoElegido) return false;
    if (!Number.isInteger(cantidadNum) || cantidadNum <= 0) return false;
    if (cantidadNum > stock) return false;
    return true;
  }, [cliente, grupoElegido, cantidadNum, stock]);

  const handleSubmit = async () => {
    if (!cliente || !grupoElegido) return;
    setLoading(true);
    setError(null);
    setConflict(false);
    try {
      const dto: SolicitudCompraRequestDTO = {
        entidadId: cliente.id,
        nombreSolicitante: cliente.nombre,
        tipoPago,
        cantidad: cantidadNum,
        // Model B: the group is the source of truth; these derive from it.
        grupoCodigo: grupoElegido.codigo,
        potenciaRequerida: potenciaDe(grupoElegido),
        tipoCombustible: grupoElegido.tipoCombustible,
        vidaUtilSolicitada: grupoElegido.vidaUtil,
      };
      const response = await createVenta(dto);
      setSummary(response);
      window.dispatchEvent(new CustomEvent("stock-updated"));
      notify("Venta registrada", "success");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setConflict(true);
        setError(err.message || "Stock insuficiente para esta solicitud.");
      } else {
        setError(
          err instanceof Error ? err.message : "Error procesando solicitud",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Closes the modal and resets the flow. GruposPanel already refetched via the
  // "stock-updated" event, so its stock reflects the sale just made.
  const handleNewSale = () => {
    setSummary(null);
    setError(null);
    setConflict(false);
    setGrupoElegido(null);
    setCliente(null);
    setCantidad("1");
    setTipoPago("CHEQUE");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-blue-950">Ventas</h1>
        <p className="text-sm text-gray-600">
          Elegí un grupo de la tabla, completá el cliente y la cantidad, y
          confirmá la venta.
        </p>
      </div>

      {conflict ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm border-2 border-red-200">
          <p className="font-semibold">Stock insuficiente</p>
          <p className="mt-1">{error}</p>
        </div>
      ) : (
        error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )
      )}

      {canSell ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
            <SalesForm
              cliente={cliente}
              onClienteChange={setCliente}
              tipoPago={tipoPago}
              onTipoPagoChange={setTipoPago}
              cantidad={cantidad}
              onCantidadChange={setCantidad}
              grupo={grupoElegido}
              canSubmit={canSubmit}
              submitting={loading}
              onSubmit={handleSubmit}
            />
            <BoletaPreview grupo={grupoElegido} cantidad={cantidadNum} />
          </div>

          <GruposPanel
            onSelect={setGrupoElegido}
            selectedCodigo={grupoElegido?.codigo ?? null}
          />
        </>
      ) : (
        <div className="bg-amber-50 text-amber-800 p-4 rounded-lg text-sm border border-amber-100">
          Necesitas rol de administrador o empleado para registrar ventas.
        </div>
      )}

      <SuccessDialog data={summary} onNewSale={handleNewSale} />
      <ToastViewport />
    </div>
  );
}
