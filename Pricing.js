import React from "https://esm.sh/react@18.3.1";
import { html } from "../lib/html.js";
import { siteConfig } from "../siteConfig.js";
import { useScrollReveal } from "../hooks/useScrollReveal.js";

function formatPrice(item) {
  if (item.price == null) return "Consulte";
  const formatted = item.price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: item.price % 1 === 0 ? 0 : 2,
  });
  return item.fromPrice ? `a partir de ${formatted}` : formatted;
}

export function Pricing() {
  const containerRef = useScrollReveal();
  const { pricing } = siteConfig;

  return html`
    <section id="servicos" ref=${containerRef} data-video-segment data-video-weight="0.9" className="py-24 px-5 md:px-8 bg-ink/85">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <p data-reveal className="text-gold text-xs tracking-[0.2em] uppercase mb-2">
          ${pricing.subtitle}
        </p>
        <h2 data-reveal className="font-serif text-3xl md:text-4xl text-cream">${pricing.title}</h2>
      </div>

      <div data-reveal className="max-w-2xl mx-auto rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl divide-y divide-white/10">
        ${pricing.items.map(
          (item) => html`
            <div
              key=${item.id}
              className="flex items-center justify-between px-6 md:px-10 py-5 hover:bg-white/[0.03] transition-colors"
            >
              <span className="text-cream text-sm md:text-base">${item.name}</span>
              <span className="font-serif text-lg text-gold">${formatPrice(item)}</span>
            </div>
          `
        )}
      </div>
    </section>
  `;
}
