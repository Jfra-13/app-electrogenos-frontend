import { useId, type InputHTMLAttributes } from "react";
import { cn } from "../../../lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

const fieldBase =
  "w-full rounded-lg border bg-white px-3 py-2 text-sm text-blue-950 " +
  "placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-orange-400 " +
  "disabled:cursor-not-allowed disabled:bg-blue-50";

export function Input({ label, error, className, id, ...props }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-blue-950">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={cn(
          fieldBase,
          error ? "border-red-400" : "border-blue-200",
          className,
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
