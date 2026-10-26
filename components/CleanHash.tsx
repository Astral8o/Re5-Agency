"use client";

import { useEffect } from "react";

// In-page links (#services, /#contact) scroll smoothly without adding "#..." to the web address,
// and visits that arrive with a "#" scroll to the section and then tidy the address.
export default function CleanHash() {
  useEffect(() => {
    const clean = () => history.replaceState(history.state, "", location.pathname + location.search);
    const go = (id: string, smooth: boolean) => {
      const el = document.getElementById(id);
      if (!el) return false;
      el.scrollIntoView({ behavior: smooth && !matchMedia("(prefers-reduced-motion: reduce)").matches ? "smooth" : "auto", block: "start" });
      return true;
    };

    if (location.hash.length > 1) {
      const id = decodeURIComponent(location.hash.slice(1));
      requestAnimationFrame(() => {
        go(id, false);
        clean();
      });
    }

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank") return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
      const id = decodeURIComponent(url.hash.slice(1));
      if (id === "top" || id === "") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        clean();
        return;
      }
      if (go(id, true)) {
        e.preventDefault();
        clean();
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
