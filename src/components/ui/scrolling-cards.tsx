"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

/** Native scroll-snap adaptation of the saved 21st card-gallery patterns.
 * No auto-scroll: preserve reading position, focus and image attribution.
 */
export default function ScrollingCards({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    const update = () =>
      setEdges({
        start: element.scrollLeft <= 2,
        end:
          element.scrollLeft + element.clientWidth >= element.scrollWidth - 2,
      });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      observer.disconnect();
      element.removeEventListener("scroll", update);
    };
  }, []);
  const move = (direction: number) => {
    const element = rail.current;
    if (!element) return;
    element.scrollBy({
      left: direction * (element.clientWidth * 0.8),
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };
  return (
    <section className="glass-gallery" aria-label={label}>
      <div className="glass-gallery-controls">
        <span>
          Explore the collection <span aria-hidden="true">↔</span>
        </span>
        <div>
          <button
            type="button"
            aria-label={`Previous ${label}`}
            disabled={edges.start}
            onClick={() => move(-1)}
          >
            <ArrowLeft size={18} />
          </button>
          <button
            type="button"
            aria-label={`Next ${label}`}
            disabled={edges.end}
            onClick={() => move(1)}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
      <div
        className="glass-card-rail"
        ref={rail}
        tabIndex={0}
        aria-label={`${label}, scroll horizontally`}
      >
        {children}
      </div>
    </section>
  );
}
