"use client";

import { useEffect, useRef } from "react";

// Silent loop of a demo website inside a laptop browser frame. Plays only while on screen.
export default function DemoLaptop({ name, url, label }: { name: string; url: string; label: string }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.3 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <figure className="h-laptop">
      <div className="h-laptop-screen">
        <div className="h-laptop-bar" aria-hidden="true">
          <i />
          <i />
          <i />
          <span>{url}</span>
        </div>
        <video ref={ref} poster={`/demo/${name}-poster.webp`} muted loop playsInline preload="metadata" width={960} height={600} aria-label={label}>
          <source src={`/demo/${name}.webm`} type="video/webm" />
          <source src={`/demo/${name}.mp4`} type="video/mp4" />
        </video>
      </div>
      <div className="h-laptop-base" aria-hidden="true" />
    </figure>
  );
}
