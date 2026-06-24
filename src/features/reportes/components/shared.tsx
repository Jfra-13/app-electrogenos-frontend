import React, { useEffect, useState } from "react";
import { ApiError } from "../../../lib/api/http";

export const card =
  "bg-white rounded-2xl border border-gray-100 shadow-sm p-6";

export type AsyncState<T> = { data?: T; loading: boolean; error?: Error };

// Re-runs `fn` whenever `deps` change (e.g. a payment-type tab switch).
export function useReportData<T>(
  fn: () => Promise<T>,
  deps: unknown[] = [],
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ loading: true });
  useEffect(() => {
    let alive = true;
    setState({ loading: true });
    fn()
      .then((data) => alive && setState({ data, loading: false }))
      .catch(
        (e) =>
          alive &&
          setState({
            loading: false,
            error: e instanceof Error ? e : new Error("Error desconocido"),
          }),
      );
    return () => {
      alive = false;
    };
    // fn is recreated each render; deps drive when the load re-runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}

// 403 -> friendly "no permission" panel; anything else -> generic error.
export function ReportError({ error }: { error: Error }) {
  const forbidden = error instanceof ApiError && error.status === 403;
  return (
    <div className={`${card} flex flex-col items-center text-center gap-3 py-12`}>
      <span className={forbidden ? "text-orange-500" : "text-red-500"}>
        {forbidden ? (
          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        ) : (
          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.33 16a2 2 0 001.74 3z" />
          </svg>
        )}
      </span>
      <p className="text-lg font-bold text-blue-950">
        {forbidden ? "Acceso restringido" : "No se pudo cargar el reporte"}
      </p>
      <p className="max-w-md text-sm text-gray-600">
        {forbidden
          ? "Este reporte requiere rol ADMIN. Iniciá sesión con una cuenta autorizada."
          : error.message}
      </p>
    </div>
  );
}

export function ReportHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-blue-950">{title}</h1>
      <p className="text-sm text-gray-600">{subtitle}</p>
    </div>
  );
}
