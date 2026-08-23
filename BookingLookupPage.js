import React from "https://esm.sh/react@18.3.1";
import { html } from "../lib/html.js";
import { BookingLookupForm } from "../components/BookingLookupForm.js";

/**
 * Standalone page for consulta.html. The primary way clients reach this
 * flow is now the "Consultar Agendamento" button in the site header (opens
 * BookingLookupModal without leaving the page) — this route stays available
 * as a direct, shareable link (e.g. in a WhatsApp confirmation message or a
 * QR code) that works even without loading the rest of the site.
 */
export function BookingLookupPage() {
  return html`
    <div className="min-h-screen bg-ink flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <h1 className="font-serif text-3xl text-cream text-center mb-2">Consultar Agendamento</h1>
        <p className="text-sm text-gray-400 text-center mb-8">
          Informe o mesmo nome e telefone usados na hora de agendar.
        </p>

        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-7">
          <${BookingLookupForm} />
        </div>

        <div className="text-center mt-8">
          <a href="./index.html" className="text-xs text-gray-400 hover:text-gold transition-colors">
            ← Voltar ao site
          </a>
        </div>
      </div>
    </div>
  `;
}
