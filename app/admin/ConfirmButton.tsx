"use client";

import { useFormStatus } from "react-dom";

/** Pulsante di submit con conferma e stato di caricamento, da usare dentro un <form>.
 *  Con `formAction` può inviare lo stesso form a una Server Action diversa
 *  (utile per avere "Salva" ed "Elimina" nello stesso form, senza annidarli). */
export function ConfirmButton({
  children,
  confirm,
  className,
  formAction,
}: {
  children: React.ReactNode;
  confirm: string;
  className?: string;
  formAction?: (formData: FormData) => void | Promise<void>;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      formAction={formAction}
      formNoValidate={formAction ? true : undefined}
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(confirm)) e.preventDefault();
      }}
      className={className}
    >
      {pending ? "…" : children}
    </button>
  );
}
