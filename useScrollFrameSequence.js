import { useEffect, useRef, useState } from "https://esm.sh/react@18.3.1";
import gsap from "https://esm.sh/gsap@3.13.0";
import { ScrollTrigger } from "https://esm.sh/gsap@3.13.0/ScrollTrigger";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion.js";

gsap.registerPlugin(ScrollTrigger);

/**
 * useScrollFrameSequence — draws a pre-rendered image sequence onto a
 * <canvas>, one frame per scroll position, instead of scrubbing a <video>'s
 * currentTime.
 *
 * Why: even with a tight keyframe interval, seeking a <video> element still
 * costs a real decode on every scroll update — on weaker Android hardware
 * decoders that shows up as exactly the "pause, then catch up" stutter
 * that video-based scroll-scrubbing is prone to. A canvas frame is just an
 * already-decoded bitmap; drawImage() is effectively instant regardless of
 * device, so this removes the stutter at its root instead of tuning around
 * it. This is the same technique Apple's product pages use for their
 * scroll-driven hero reveals.
 *
 * Per-section mapping (same idea as before): any element tagged
 * `data-video-segment` gets its own slice of the frame sequence,
 * proportional to its rendered pixel height × `data-video-weight` (default
 * 1), computed in document order. A single continuous ScrollTrigger over
 * the whole page drives it — never multiple overlapping triggers — so the
 * frame index is a strictly monotonic function of scroll position with no
 * seams between sections.
 *
 * @param {React.RefObject<HTMLCanvasElement>} canvasRef
 * @param {string[]} frameUrls — ordered list of frame image URLs
 */
export function useScrollFrameSequence(canvasRef, frameUrls) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [firstFrameReady, setFirstFrameReady] = useState(false);
  const imagesRef = useRef([]);
  const breakpointsRef = useRef([]);
  const currentIndexRef = useRef(0);

  // Preload every frame as an Image(); draw whichever index is current
  // whenever a new one finishes loading (covers the reduced-motion single
  // static frame case too).
  useEffect(() => {
    if (!frameUrls || frameUrls.length === 0) return;
    let cancelled = false;

    function drawFrame(index) {
      const canvas = canvasRef.current;
      const img = imagesRef.current[index];
      if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;
      const ctx = canvas.getContext("2d");
      const cw = canvas.width;
      const ch = canvas.height;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      // object-fit: cover math
      const scale = Math.max(cw / iw, ch / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh);
    }

    if (prefersReducedMotion) {
      const staticIndex = Math.floor(frameUrls.length * 0.15);
      const img = new Image();
      img.src = frameUrls[staticIndex];
      imagesRef.current[staticIndex] = img;
      img.onload = () => {
        if (cancelled) return;
        currentIndexRef.current = staticIndex;
        drawFrame(staticIndex);
        setFirstFrameReady(true);
      };
      return () => {
        cancelled = true;
      };
    }

    let loadedCount = 0;
    frameUrls.forEach((url, i) => {
      const img = new Image();
      img.src = url;
      imagesRef.current[i] = img;
      img.onload = () => {
        if (cancelled) return;
        loadedCount += 1;
        if (i === 0) {
          currentIndexRef.current = 0;
          drawFrame(0);
          setFirstFrameReady(true);
        }
        if (i === currentIndexRef.current) drawFrame(i);
      };
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReducedMotion, frameUrls.join("|")]);

  // Canvas sizing, kept in sync with viewport (capped DPR so weak GPUs
  // aren't pushed into rendering an unnecessarily huge backing buffer).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      const img = imagesRef.current[currentIndexRef.current];
      if (img && img.complete) {
        const ctx = canvas.getContext("2d");
        const cw = canvas.width;
        const ch = canvas.height;
        const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
        const dw = img.naturalWidth * scale;
        const dh = img.naturalHeight * scale;
        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      }
    }

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [canvasRef]);

  // Scroll-driven frame selection.
  useEffect(() => {
    if (prefersReducedMotion || !frameUrls || frameUrls.length === 0) return;

    const frameCount = frameUrls.length;
    let scrollTrigger;
    let cancelled = false;

    function computeBreakpoints() {
      const segments = Array.from(document.querySelectorAll("[data-video-segment]"));
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (segments.length === 0 || scrollableHeight <= 0) {
        breakpointsRef.current = [{ startFrac: 0, endFrac: 1, segStart: 0, segEnd: frameCount - 1 }];
        return;
      }

      const weights = segments.map((el) => parseFloat(el.dataset.videoWeight) || 1);
      const totalWeight = weights.reduce((a, b) => a + b, 0);

      let frameCursor = 0;
      breakpointsRef.current = segments.map((el, i) => {
        const rect = el.getBoundingClientRect();
        const absoluteTop = rect.top + window.scrollY;
        const absoluteBottom = absoluteTop + el.offsetHeight;
        const startFrac = Math.min(Math.max(absoluteTop / scrollableHeight, 0), 1);
        const endFrac = Math.min(Math.max(absoluteBottom / scrollableHeight, 0), 1);

        const segStart = (frameCursor / totalWeight) * (frameCount - 1);
        frameCursor += weights[i];
        const segEnd = (frameCursor / totalWeight) * (frameCount - 1);

        return { startFrac, endFrac, segStart, segEnd };
      });
    }

    function indexForProgress(progress) {
      const breakpoints = breakpointsRef.current;
      for (const b of breakpoints) {
        if (progress <= b.endFrac || b === breakpoints[breakpoints.length - 1]) {
          const span = b.endFrac - b.startFrac;
          const local = span > 0 ? (progress - b.startFrac) / span : 0;
          const clamped = Math.min(Math.max(local, 0), 1);
          return Math.round(b.segStart + clamped * (b.segEnd - b.segStart));
        }
      }
      return frameCount - 1;
    }

    function drawFrame(index) {
      const canvas = canvasRef.current;
      const img = imagesRef.current[index];
      if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;
      const ctx = canvas.getContext("2d");
      const cw = canvas.width;
      const ch = canvas.height;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    }

    computeBreakpoints();

    scrollTrigger = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      // No custom smoothing tween on top of this — a canvas draw is cheap
      // enough to update 1:1 with scroll, which is what makes this feel
      // instantaneous instead of "catching up" after a pause.
      onRefresh: computeBreakpoints,
      onUpdate: (self) => {
        const index = indexForProgress(self.progress);
        if (index !== currentIndexRef.current) {
          currentIndexRef.current = index;
          if (!cancelled) drawFrame(index);
        }
      },
    });

    return () => {
      cancelled = true;
      if (scrollTrigger) scrollTrigger.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReducedMotion, frameUrls.join("|"), canvasRef]);

  return { firstFrameReady };
}
