import { useEffect, useRef, type ReactNode } from "react";

type SlideOverProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
};

// Right-anchored panel built on native <dialog> for the same a11y wins as Modal.
// ponytail: no enter/exit animation polish — add @starting-style transitions if
// the panel ever needs to feel less abrupt.
export function SlideOver({
  open,
  onClose,
  title,
  children,
  footer,
}: SlideOverProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="fixed inset-0 m-0 h-full max-h-full w-full max-w-full bg-transparent p-0 backdrop:bg-black/40"
    >
      <div className="ml-auto flex h-full w-full max-w-md flex-col bg-white text-blue-950 shadow-xl">
        <div className="flex items-center justify-between border-b border-blue-100 px-6 py-4">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="ml-auto rounded-md p-1 text-blue-400 hover:bg-blue-50 hover:text-blue-950"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-blue-100 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </dialog>
  );
}
