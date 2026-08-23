import React, { useEffect, useRef } from "https://esm.sh/react@18.3.1";
import { html } from "../lib/html.js";
import gsap from "https://esm.sh/gsap@3.13.0";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion.js";

/**
 * LogoBadge — the circular "Liverpool Barbearia" medallion, in place of a
 * plain text title.
 *
 * Entrance: a simple fade + scale-in from near-invisible, once, on load.
 *
 * Interaction (the signature element of this page) is input-appropriate
 * rather than one-size-fits-all:
 *  - Fine pointer (mouse, desktop): the badge tilts in 3D to follow the
 *    cursor, like a medallion catching the light.
 *  - Coarse pointer (touch, mobile): tilting the badge with a finger-drag
 *    would fight with vertical page scrolling on the exact same gesture, so
 *    instead the badge responds to the phone's own tilt via the device's
 *    orientation sensor — turn the phone in your hand and the medallion
 *    turns with it. This never captures a touch/scroll gesture at all, so
 *    it can't ever re-introduce the scroll-lock bug a touch-drag approach
 *    had. iOS requires a permission prompt for motion sensors, requested on
 *    the first tap on the badge; if it's denied or unsupported, the badge
 *    simply stays in its resting entrance pose — never a hard failure.
 * Both modes spring back to resting flat when input stops.
 */
export function LogoBadge() {
  const badgeRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const badge = badgeRef.current;
    if (!badge) return;

    if (prefersReducedMotion) {
      gsap.set(badge, { opacity: 1, scale: 1, rotateX: 0, rotateY: 0 });
      return;
    }

    gsap.set(badge, { opacity: 0, scale: 0.85, rotateX: 0, rotateY: 0, transformPerspective: 900 });
    gsap.to(badge, { opacity: 1, scale: 1, duration: 1.1, delay: 0.15, ease: "power2.out" });

    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const MAX_TILT = 16; // degrees

    const cleanupFns = [];

    if (!isCoarsePointer) {
      // --- Desktop: pointer-follow tilt ---------------------------------
      const setRotateX = gsap.quickTo(badge, "rotateX", { duration: 0.5, ease: "power3.out" });
      const setRotateY = gsap.quickTo(badge, "rotateY", { duration: 0.5, ease: "power3.out" });

      function handlePointerMove(e) {
        const rect = badge.getBoundingClientRect();
        const offsetX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const offsetY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        setRotateY(offsetX * MAX_TILT);
        setRotateX(-offsetY * MAX_TILT);
      }

      function resetTilt() {
        setRotateX(0);
        setRotateY(0);
      }

      badge.addEventListener("pointermove", handlePointerMove);
      badge.addEventListener("pointerleave", resetTilt);
      cleanupFns.push(() => {
        badge.removeEventListener("pointermove", handlePointerMove);
        badge.removeEventListener("pointerleave", resetTilt);
      });
    } else if (typeof DeviceOrientationEvent !== "undefined") {
      // --- Mobile: gyroscope-follow tilt, never touches scroll ----------
      const setRotateX = gsap.quickTo(badge, "rotateX", { duration: 0.35, ease: "power3.out" });
      const setRotateY = gsap.quickTo(badge, "rotateY", { duration: 0.35, ease: "power3.out" });
      let baseline = null; // calibrate on first reading so any phone-holding angle counts as "neutral"

      function handleOrientation(e) {
        if (e.beta == null || e.gamma == null) return;
        if (!baseline) baseline = { beta: e.beta, gamma: e.gamma };
        const deltaGamma = gsap.utils.clamp(-MAX_TILT, MAX_TILT, (e.gamma - baseline.gamma) * 0.8);
        const deltaBeta = gsap.utils.clamp(-MAX_TILT, MAX_TILT, (e.beta - baseline.beta) * 0.8);
        setRotateY(deltaGamma);
        setRotateX(deltaBeta);
      }

      function attach() {
        window.addEventListener("deviceorientation", handleOrientation);
        cleanupFns.push(() => window.removeEventListener("deviceorientation", handleOrientation));
      }

      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        // iOS 13+: must be requested from a direct user gesture.
        function requestOnFirstTap() {
          DeviceOrientationEvent.requestPermission()
            .then((state) => state === "granted" && attach())
            .catch(() => {});
          badge.removeEventListener("pointerdown", requestOnFirstTap);
        }
        badge.addEventListener("pointerdown", requestOnFirstTap);
        cleanupFns.push(() => badge.removeEventListener("pointerdown", requestOnFirstTap));
      } else {
        attach();
      }
    }

    return () => cleanupFns.forEach((fn) => fn());
  }, [prefersReducedMotion]);

  return html`
    <div
      className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 touch-pan-y"
      style=${{ perspective: "900px" }}
    >
      <div
        ref=${badgeRef}
        className="relative w-full h-full"
        style=${{ transformStyle: "preserve-3d", willChange: "transform, opacity" }}
      >
        <picture>
          <source srcSet="./assets/img/logo-3d.webp" type="image/webp" />
          <img
            src="./assets/img/logo-3d.png"
            alt="Liverpool Barbearia"
            className="w-full h-full object-contain select-none pointer-events-none"
            draggable="false"
          />
        </picture>
      </div>
    </div>
  `;
}
