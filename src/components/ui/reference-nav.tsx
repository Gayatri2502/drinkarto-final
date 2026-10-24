"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const links = [
  ["StateLens", "/prices"],
  ["LocalPour", "/localpour"],
  ["Library", "/catalogue"],
  ["Knowledge", "/guides"],
  ["Compare", "/compare"],
  ["Recipes", "/recipes"],
];

/** Sliding indicator inspired by educalvolpz / Animated Tabs on 21st.
 * These are document links, so retain nav semantics and native Tab navigation.
 */
export default function ReferenceNav({
  path,
  open,
  onNavigate,
}: {
  path: string;
  open: boolean;
  onNavigate: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  useEffect(() => {
    const nav = ref.current;
    if (!nav) return;
    const measure = () => {
      const current = nav.querySelector<HTMLElement>('[aria-current="page"]');
      setIndicator({
        left: current?.offsetLeft ?? 0,
        width: current?.offsetWidth ?? 0,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [path, open]);
  return (
    <nav
      id="reference-navigation"
      ref={ref}
      className={`public-nav reference-nav${open ? " is-open" : ""}`}
      aria-label="Public navigation"
    >
      <span
        className="nav-active-indicator"
        aria-hidden="true"
        style={{
          transform: `translateX(${indicator.left}px)`,
          width: indicator.width,
        }}
      />
      {links.map(([name, url]) => (
        <Link
          key={url}
          href={url}
          aria-current={
            path === url || path.startsWith(url + "/") ? "page" : undefined
          }
          onClick={onNavigate}
        >
          {name}
        </Link>
      ))}
    </nav>
  );
}
