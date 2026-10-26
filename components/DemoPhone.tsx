"use client";

import { useEffect, useRef } from "react";

// Silent loop of the RE5 Digital demo being ordered from, inside a phone frame.
// Plays only while on screen; people who prefer reduced motion see the still image.
export default function DemoPhone() {
  const ref = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.3 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <figure className="h-phone">
      <div className="h-phone-body">
        <video
          ref={ref}
          poster="/digital/demo-loop-poster.webp"
          muted
          loop
          playsInline
          preload="metadata"
          width={360}
          height={784}
          aria-label="A customer receives a menu link on WhatsApp, adds dishes and sends the order back to the business"
        >
          <source src="/digital/demo-loop.webm" type="video/webm" />
          <source src="/digital/demo-loop.mp4" type="video/mp4" />
        </video>
      </div>
      <figcaption>
        <span className="h-live-dot" aria-hidden="true" /> RE5 Digital in action
      </figcaption>
    </figure>
  );
}
