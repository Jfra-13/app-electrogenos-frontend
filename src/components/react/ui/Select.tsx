import { useId, type SelectHTMLAttributes } from "react";
import { cn } from "../../../lib/cn";

type Option = { value: string; label: string };

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  options: ReadonlyArray<Option>;
  placeholder?: string;
};

const fieldBase =
  "w-full rounded-lg border bg-white px-3 py-2 text-sm text-blue-950 " +
  "focus:outline-none focus:ring-2 focus:ring-orange-400 " +
  "disabled:cursor-not-allowed disabled:bg-blue-50";

export function Select({
  label,
  error,
  options,
  placeholder,
  className,
  id,
  ...props
}: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-xs font-medium text-blue-950">
          {label}
        </label>
      )}
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        className={cn(
          fieldBase,
          error ? "border-red-400" : "border-blue-200",
          className,
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
