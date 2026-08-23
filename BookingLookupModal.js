import React from "https://esm.sh/react@18.3.1";
import { html } from "../lib/html.js";
import { BookingLookupForm } from "./BookingLookupForm.js";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock.js";

export function BookingLookupModal({ open, onClose }) {
  useBodyScrollLock(open);

  if (!open) return null;

  return html`
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick=${(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#15171b] p-7 md:p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-serif text-xl text-cream">Consultar Agendamento</h3>
          <button type="button" onClick=${onClose} aria-label="Fechar" className="text-gray-400 hover:text-cream">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-5">
          Informe o mesmo nome e telefone usados na hora de agendar.
        </p>

        <${BookingLookupForm} />
      </div>
    </div>
  `;
}
