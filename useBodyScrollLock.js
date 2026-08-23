import { useEffect } from "https://esm.sh/react@18.3.1";

/**
 * useBodyScrollLock — locks background scroll while a modal is open, and
 * compensates for the scrollbar's width so the page doesn't visibly shift
 * sideways the instant the scrollbar disappears (a very common "lateral
 * jump" bug: hiding overflow removes the scrollbar, which widens the
 * viewport by the scrollbar's width and shoves everything a few pixels to
 * the side — padding the right edge by that same amount cancels it out).
 *
 * @param {boolean} locked
 */
export function useBodyScrollLock(locked) {
  useEffect(() => {
    if (!locked) return;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [locked]);
}
