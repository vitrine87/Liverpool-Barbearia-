import React from "https://esm.sh/react@18.3.1";
import { html } from "../lib/html.js";
import { siteConfig } from "../siteConfig.js";
import { useScrollReveal } from "../hooks/useScrollReveal.js";

function InfoRow({ label, children }) {
  return html`
    <div className="flex flex-col gap-1">
      <span className="text-[11px] tracking-[0.15em] uppercase text-gold">${label}</span>
      <span className="text-sm text-gray-200">${children}</span>
    </div>
  `;
}

export function Contact() {
  const containerRef = useScrollReveal();
  const { contact, hours } = siteConfig;

  return html`
    <section id="contato" ref=${containerRef} data-video-segment data-video-weight="1.0" className="py-24 px-5 md:px-8 bg-ink/85">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
        <div
          data-reveal
          className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 md:p-10 flex flex-col gap-6"
        >
          <p className="text-gold text-xs tracking-[0.2em] uppercase">— Fale Conosco</p>
          <h2 className="font-serif text-3xl text-cream">Venha nos conhecer.</h2>

          <${InfoRow} label="Telefone">${contact.phoneDisplay}<//>
          <${InfoRow} label="Endereço">
            ${contact.address.line1}, ${contact.address.line2}
            <br />
            <span className="text-gray-400 text-xs">${contact.address.landmark}</span>
          <//>
          <${InfoRow} label="Instagram">
            <a
              href=${contact.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold transition-colors"
            >
              ${contact.instagramHandle}
            </a>
          <//>

          <div>
            <span className="text-[11px] tracking-[0.15em] uppercase text-gold">Horário</span>
            <div className="mt-2 grid grid-cols-1 gap-1 text-sm text-gray-300">
              ${hours.map(
                (h) => html`
                  <div key=${h.day} className="flex justify-between border-b border-white/5 py-1.5">
                    <span>${h.day}</span>
                    <span className="text-gray-400">${h.value}</span>
                  </div>
                `
              )}
            </div>
          </div>
        </div>

        <div data-reveal className="rounded-3xl overflow-hidden border border-white/10 min-h-[320px]">
          <iframe
            title="Mapa da Liverpool Barbearia"
            src=${contact.mapEmbedUrl}
            className="w-full h-full min-h-[320px]"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </section>
  `;
}
