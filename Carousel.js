import React, { useEffect, useRef, useState } from "https://esm.sh/react@18.3.1";
import { html } from "../lib/html.js";
import gsap from "https://esm.sh/gsap@3.13.0";
import { Draggable } from "https://esm.sh/gsap@3.13.0/Draggable";
import { InertiaPlugin } from "https://esm.sh/gsap@3.13.0/InertiaPlugin";
import { supabase } from "../lib/supabaseClient.js";
import { siteConfig } from "../siteConfig.js";
import { useScrollReveal } from "../hooks/useScrollReveal.js";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion.js";

gsap.registerPlugin(Draggable, InertiaPlugin);

async function fetchCarouselPhotos() {
  const { data, error } = await supabase.storage.from("carrossel-fotos").list("", {
    limit: 20,
    sortBy: { column: "created_at", order: "desc" },
  });

  if (error || !data || data.length === 0) {
    return siteConfig.carouselFallback;
  }

  return data
    .filter((f) => f.name && !f.name.startsWith("."))
    .map((f) => ({
      id: f.id || f.name,
      alt: f.name,
      src: supabase.storage.from("carrossel-fotos").getPublicUrl(f.name).data.publicUrl,
    }));
}

export function Carousel() {
  const sectionRef = useScrollReveal();
  const trackRef = useRef(null);
  const [photos, setPhotos] = useState(siteConfig.carouselFallback);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    let mounted = true;
    fetchCarouselPhotos().then((data) => mounted && setPhotos(data));
    return () => {
      mounted = false;
    };
  }, []);

  // Seamless infinite loop: duplicate the list once, animate translateX from
  // 0 to -50% of the doubled track, then snap back to 0 (invisible, since
  // the second half is an exact copy of the first).
  useEffect(() => {
    const track = trackRef.current;
    if (!track || photos.length === 0) return;

    if (prefersReducedMotion) return; // static row, no loop, no Draggable

    const ctx = gsap.context(() => {
      const totalWidth = track.scrollWidth / 2;
      const tween = gsap.to(track, {
        x: -totalWidth,
        duration: photos.length * 4,
        ease: "none",
        repeat: -1,
      });

      const drag = Draggable.create(track, {
        type: "x",
        inertia: true,
        allowNativeTouchScrolling: true, // never intercept vertical page scroll
        onDragStart: () => tween.pause(),
        onDragEnd: () => tween.resume(),
        onPress: () => tween.pause(),
      })[0];

      function pause() {
        tween.pause();
      }
      function resume() {
        if (!drag.isDragging) tween.resume();
      }
      track.addEventListener("mouseenter", pause);
      track.addEventListener("mouseleave", resume);

      return () => {
        track.removeEventListener("mouseenter", pause);
        track.removeEventListener("mouseleave", resume);
      };
    }, track);

    return () => ctx.revert();
  }, [photos, prefersReducedMotion]);

  const doubled = [...photos, ...photos];

  return html`
    <section id="servicos-carrossel" ref=${sectionRef} data-video-segment data-video-weight="0.8" className="py-20 bg-ink/30 overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 md:px-8 mb-10">
        <p data-reveal className="text-gold text-xs tracking-[0.2em] uppercase mb-2">— Nosso Trabalho</p>
        <h2 data-reveal className="font-serif text-3xl md:text-4xl text-cream">Cada corte, uma assinatura.</h2>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-ink to-transparent z-10"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-ink to-transparent z-10"></div>

        <div
          ref=${trackRef}
          className="flex gap-4 px-5 md:px-8 w-max cursor-grab active:cursor-grabbing select-none touch-pan-y"
        >
          ${doubled.map(
            (photo, i) => html`
              <div
                key=${`${photo.id}-${i}`}
                className="w-56 h-72 md:w-64 md:h-80 flex-shrink-0 rounded-2xl overflow-hidden border border-white/10"
              >
                <img src=${photo.src} alt=${photo.alt} className="w-full h-full object-cover" draggable="false" />
              </div>
            `
          )}
        </div>
      </div>
    </section>
  `;
}
