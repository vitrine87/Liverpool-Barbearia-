import { useEffect, useRef } from "https://esm.sh/react@18.3.1";
import gsap from "https://esm.sh/gsap@3.13.0";
import { ScrollTrigger } from "https://esm.sh/gsap@3.13.0/ScrollTrigger";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion.js";

gsap.registerPlugin(ScrollTrigger);

/**
 * useScrollReveal — attach to a section wrapper.
 *
 * - Any child carrying `data-reveal` fades + rises into place (short
 *   translateY), staggered, the first time the section enters the viewport.
 * - A single child carrying `data-reveal-title` (usually the section's main
 *   heading) gets its own more cinematic treatment instead — a slower pure
 *   fade-in with a gentle scale-up, no big movement — and leads the
 *   sequence: it starts first, and the staggered `data-reveal` items cascade
 *   in shortly after it (not waiting for it to fully finish), giving a
 *   "title leads, rest follows" premium entrance instead of everything
 *   fading in identically at once.
 *
 * Never re-triggers on scroll-up (toggleActions "play none none none"), so
 * there's no flicker. On page load, if the section is already in view (e.g.
 * the Hero), the entrance plays immediately once mounted.
 *
 * Respects prefers-reduced-motion: if active, everything is shown
 * immediately with no animation at all, and no ScrollTrigger is created —
 * one less thing for a weak CPU to track.
 *
 * @param {object} [options]
 * @param {number} [options.stagger=0.12] seconds between each `data-reveal` item
 * @param {number} [options.delay=0] seconds to wait before this section's
 *   own reveal timeline starts — useful when another, separately-animated
 *   element in the same section (e.g. LogoBadge) should visually lead
 *   before the text/buttons cascade in.
 */
export function useScrollReveal({ stagger = 0.12, delay = 0 } = {}) {
  const containerRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const titleTarget = container.querySelector("[data-reveal-title]");
    const items = Array.from(container.querySelectorAll("[data-reveal]"));
    if (!titleTarget && items.length === 0) return;

    if (prefersReducedMotion) {
      if (titleTarget) gsap.set(titleTarget, { opacity: 1, y: 0, scale: 1, clearProps: "opacity,transform" });
      if (items.length) gsap.set(items, { opacity: 1, y: 0, clearProps: "opacity,transform" });
      return;
    }

    if (titleTarget) gsap.set(titleTarget, { opacity: 0, y: 14, scale: 0.97 });
    if (items.length) gsap.set(items, { opacity: 0, y: 32 });

    const allTargets = titleTarget ? [titleTarget, ...items] : items;

    const timeline = gsap.timeline({
      delay,
      scrollTrigger: {
        trigger: container,
        start: "top 80%",
        toggleActions: "play none none none",
      },
      onStart: () => gsap.set(allTargets, { willChange: "transform, opacity" }),
      onComplete: () => gsap.set(allTargets, { clearProps: "willChange" }),
    });

    if (titleTarget) {
      timeline.to(titleTarget, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.1,
        ease: "power2.out",
      });
    }

    if (items.length) {
      timeline.to(
        items,
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger },
        titleTarget ? "-=0.7" : 0 // items start cascading before the title tween fully finishes
      );
    }

    return () => {
      timeline.scrollTrigger && timeline.scrollTrigger.kill();
      timeline.kill();
    };
  }, [prefersReducedMotion, stagger, delay]);

  return containerRef;
}
