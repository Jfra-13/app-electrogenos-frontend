import { useEffect, useRef, type ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
};

// Native <dialog>: focus trap, Esc, and inert background come for free.
export function Modal({ open, onClose, title, children, footer }: ModalProps) {
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
        // Clicks on the backdrop have the dialog itself as target.
        if (e.target === ref.current) onClose();
      }}
      className="m-auto w-full max-w-lg rounded-2xl bg-white p-0 text-blue-950 shadow-xl backdrop:bg-black/40"
    >
      <div className="flex flex-col">
        {title && (
          <div className="flex items-center justify-between border-b border-blue-100 px-6 py-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="rounded-md p-1 text-blue-400 hover:bg-blue-50 hover:text-blue-950"
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
        )}
        <div className="px-6 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-blue-100 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </dialog>
  );
}
