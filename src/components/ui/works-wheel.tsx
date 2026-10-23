"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { bottlePose } from "@/lib/bottle-stage";
import "./works-wheel.css";

export interface WorksWheelItem {
  title: string;
  image: string;
  alt?: string;
  category?: string;
  credit?: {
    author: string;
    source: string;
    license: string;
    licenseUrl: string;
  };
  href?: string;
}
export interface WorksWheelProps extends Omit<
  React.ComponentPropsWithoutRef<"section">,
  "children"
> {
  items: WorksWheelItem[];
  label?: string;
  action?: string;
}
const clamp = (value: number, last: number) =>
  Math.max(0, Math.min(last, value));

/** Adapted from the supplied wheel: large, upright cutouts replace the rotating drum. */
export function WorksWheel({
  items,
  label = "The bottle edit.",
  action = "Explore references",
  className,
  ...props
}: WorksWheelProps) {
  const id = React.useId();
  const stageRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const position = React.useRef(0);
  const target = React.useRef(0);
  const wake = React.useRef<() => void>(() => {});
  const settle = React.useRef(0);
  const drag = React.useRef<{
    x: number;
    y: number;
    last: number;
    moving: boolean;
  } | null>(null);
  const [active, setActive] = React.useState(0);
  const [width, setWidth] = React.useState(0);
  const [reduced, setReduced] = React.useState(false);
  const last = Math.max(0, items.length - 1);
  React.useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const read = () => setReduced(query.matches);
    read();
    query.addEventListener("change", read);
    return () => query.removeEventListener("change", read);
  }, []);
  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const read = () => setWidth(el.clientWidth);
    const observer = new ResizeObserver(read);
    observer.observe(el);
    read();
    return () => observer.disconnect();
  }, []);
  React.useEffect(() => {
    let frame = 0;
    const draw = () => {
      const difference = target.current - position.current;
      position.current =
        Math.abs(difference) < 0.001 || reduced
          ? target.current
          : position.current + difference * 0.13;
      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const distance = index - position.current;
        const pose = bottlePose(distance, width);
        card.style.transform = pose.transform;
        card.style.opacity = String(pose.opacity);
        card.style.zIndex = String(pose.zIndex);
        card.style.pointerEvents = Math.abs(distance) < 1.6 ? "auto" : "none";
      });
      setActive(clamp(Math.round(position.current), last));
      if (Math.abs(target.current - position.current) >= 0.001)
        frame = requestAnimationFrame(draw);
    };
    wake.current = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    };
    wake.current();
    return () => {
      cancelAnimationFrame(frame);
      wake.current = () => {};
    };
  }, [width, reduced, last]);
  const go = React.useCallback(
    (index: number) => {
      target.current = clamp(index, last);
      wake.current();
    },
    [last],
  );
  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const wheel = (event: WheelEvent) => {
      if (reduced || event.ctrlKey || items.length < 2) return;
      const delta =
        event.deltaY *
        (event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? el.clientHeight
            : 1);
      if (
        (delta < 0 && target.current <= 0) ||
        (delta > 0 && target.current >= last)
      )
        return;
      event.preventDefault();
      go(target.current + delta / 650);
      clearTimeout(settle.current);
      settle.current = window.setTimeout(
        () => go(Math.round(target.current)),
        160,
      );
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", wheel);
      clearTimeout(settle.current);
    };
  }, [go, last, reduced, items.length]);
  const item = items[active];
  return (
    <section
      className={["works-wheel", className].filter(Boolean).join(" ")}
      aria-label={label}
      {...props}
    >
      <div className="ww-front-title">
        <span>{item?.category}</span>
        <strong>{item?.title}</strong>
        <p>Explore the bottle. Know the reference.</p>
      </div>
      <div
        ref={stageRef}
        className="ww-stage"
        role="listbox"
        aria-label={label}
        aria-activedescendant={`${id}-${active}`}
        aria-describedby={`${id}-instructions`}
        tabIndex={0}
        onKeyDown={(event) => {
          const next =
            event.key === "ArrowRight" || event.key === "ArrowDown"
              ? Math.round(target.current) + 1
              : event.key === "ArrowLeft" || event.key === "ArrowUp"
                ? Math.round(target.current) - 1
                : event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? last
                    : null;
          if (next !== null) {
            event.preventDefault();
            go(next);
          }
        }}
        onPointerDown={(event) => {
          if (event.pointerType === "mouse" && event.button !== 0) return;
          drag.current = {
            x: event.clientX,
            y: event.clientY,
            last: event.clientX,
            moving: false,
          };
        }}
        onPointerMove={(event) => {
          const current = drag.current;
          if (!current) return;
          if (!current.moving) {
            if (
              Math.abs(event.clientX - current.x) < 8 ||
              Math.abs(event.clientX - current.x) <
                Math.abs(event.clientY - current.y)
            )
              return;
            current.moving = true;
            event.currentTarget.setPointerCapture(event.pointerId);
          }
          go(target.current + (current.last - event.clientX) / 240);
          current.last = event.clientX;
        }}
        onPointerUp={() => {
          if (drag.current?.moving) go(Math.round(target.current));
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
          go(Math.round(target.current));
        }}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
      >
        <div className="ww-drum">
          {items.map((bottle, index) => (
            <button
              key={bottle.title}
              id={`${id}-${index}`}
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
              role="option"
              aria-label={bottle.title}
              aria-selected={index === active}
              tabIndex={-1}
              className="ww-card"
              onClick={() => go(index)}
            >
              <span className="ww-face">
                <img
                  className="ww-bottle-image"
                  src={bottle.image}
                  alt={bottle.alt ?? bottle.title}
                  draggable={false}
                  width={400}
                  height={800}
                  loading="lazy"
                  decoding="async"
                />
              </span>
            </button>
          ))}
        </div>
      </div>
      <ol className="ww-index">
        {items.map((bottle, index) => (
          <li key={bottle.title}>
            <button
              type="button"
              className={
                index === active
                  ? "ww-index-button is-active"
                  : "ww-index-button"
              }
              aria-pressed={index === active}
              onClick={() => go(index)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {bottle.title}
            </button>
          </li>
        ))}
      </ol>
      <div className="ww-controls">
        <div>
          <button
            type="button"
            aria-label="Previous bottle"
            disabled={active === 0}
            onClick={() => go(Math.round(target.current) - 1)}
          >
            <ArrowLeft size={18} />
          </button>
          <span aria-live="polite">
            {items.length ? active + 1 : 0} / {items.length}
          </span>
          <button
            type="button"
            aria-label="Next bottle"
            disabled={active === last}
            onClick={() => go(Math.round(target.current) + 1)}
          >
            <ArrowRight size={18} />
          </button>
        </div>
        {item?.href && (
          <a href={item.href}>
            {action}
            <ArrowUpRight size={16} />
          </a>
        )}
      </div>
      <p id={`${id}-instructions`} className="ww-instructions">
        Swipe sideways, scroll gently or use the arrows
      </p>
      <details className="ww-credits">
        <summary>Photography credits</summary>
        <ul>
          {items
            .filter((bottle) => bottle.credit)
            .map((bottle) => (
              <li key={bottle.title}>
                {bottle.title}:{" "}
                <a
                  href={bottle.credit!.source}
                  target="_blank"
                  rel="noreferrer"
                >
                  {bottle.credit!.author}
                </a>{" "}
                ·{" "}
                <a
                  href={bottle.credit!.licenseUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {bottle.credit!.license}
                </a>
              </li>
            ))}
        </ul>
        <p>
          Photographic cutouts presented with CSS 3D depth. Resized to WebP with
          transparency preserved. Historical packaging may differ.
        </p>
      </details>
    </section>
  );
}
export default WorksWheel;
