"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Viewport-entry pattern adapted from 21st / asanshay Reveal.
 * Content stays visible without JS; Web Animations avoids hidden SSR content.
 */
export default function Reveal({
  children,
  className,
  index = 0,
}: {
  children: ReactNode;
  className?: string;
  index?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!element || preference.matches || !("IntersectionObserver" in window))
      return;
    let animation: Animation | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (!preference.matches)
          animation = element.animate(
            [
              { opacity: 0.5, transform: "translateY(16px)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            {
              duration: 550,
              delay: Math.min(index, 3) * 70,
              easing: "cubic-bezier(.2,.65,.3,1)",
            },
          );
        observer.disconnect();
      },
      { threshold: 0.08 },
    );
    const stop = () => {
      if (preference.matches) animation?.cancel();
    };
    preference.addEventListener("change", stop);
    observer.observe(element);
    return () => {
      observer.disconnect();
      animation?.cancel();
      preference.removeEventListener("change", stop);
    };
  }, [index]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
