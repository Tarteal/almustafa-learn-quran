import { useEffect } from "react";

/**
 * Globally fades in text elements as they scroll into view.
 */
export function useScrollReveal() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const SELECTOR = "h1, h2, h3, h4, h5, h6, p, li, blockquote";

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    const tagAndObserve = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        if (el.dataset.reveal === "done") return;
        if (el.closest("nav, header, footer, [data-no-reveal]")) return;
        el.classList.add("reveal-on-scroll");
        el.dataset.reveal = "done";
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          requestAnimationFrame(() => el.classList.add("is-visible"));
        } else {
          observer.observe(el);
        }
      });
    };

    tagAndObserve(document.body);

    const mutation = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (node.nodeType === 1) tagAndObserve(node as Element);
        });
      }
    });
    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutation.disconnect();
    };
  }, []);
}
