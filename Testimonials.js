import React from "https://esm.sh/react@18.3.1";
import { html } from "../lib/html.js";
import { siteConfig } from "../siteConfig.js";
import { useScrollReveal } from "../hooks/useScrollReveal.js";

function Stars({ count }) {
  return html`
    <div className="flex gap-0.5 text-gold">
      ${Array.from({ length: count }).map(
        (_, i) => html`
          <svg key=${i} viewBox="0 0 20 20" className="w-4 h-4 fill-current">
            <path
              d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6z"
            />
          </svg>
        `
      )}
    </div>
  `;
}

export function Testimonials() {
  const containerRef = useScrollReveal();

  return html`
    <section id="depoimentos" ref=${containerRef} data-video-segment data-video-weight="0.9" className="py-24 px-5 md:px-8 bg-ink/80">
      <div className="max-w-3xl mx-auto text-center mb-14">
        <h2 data-reveal className="font-serif text-3xl md:text-4xl text-cream">
          O que dizem nossos <em className="italic">clientes</em>
        </h2>
      </div>

      <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${siteConfig.testimonials.map(
          (t) => html`
            <div
              key=${t.id}
              data-reveal
              className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-7 flex flex-col gap-4 hover:scale-[1.02] transition-transform"
            >
              <${Stars} count=${t.rating} />
              <p className="text-sm text-gray-200 leading-relaxed italic">"${t.text}"</p>
              <div className="mt-auto pt-4 border-t border-white/10">
                <div className="text-cream text-sm font-medium">${t.name}</div>
                <div className="text-gray-400 text-xs uppercase tracking-wide">${t.role}</div>
              </div>
            </div>
          `
        )}
      </div>
    </section>
  `;
}
