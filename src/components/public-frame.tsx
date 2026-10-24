"use client";
import Link from "next/link";
import AgeGate from "./age-gate";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import ReferenceNav from "./ui/reference-nav";
import { ArrowUpRight, Menu, X } from "lucide-react";
export default function PublicFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuRef.current?.focus();
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);
  return (
    <div className="public-site">
      <a className="public-skip" href="#public-main">
        Skip to content
      </a>
      <div className="public-topline">
        THE DRINKARTO REFERENCE{" "}
        <span>INDIA · INDEPENDENT INFORMATION · NO ONLINE SALES</span>
      </div>
      <header className="public-header">
        <Link href="/" className="public-logo" aria-label="Drinkarto home">
          <span>D</span>drinkarto<small>A LITTLE MORE KNOWING</small>
        </Link>
        <button
          ref={menuRef}
          aria-controls="reference-navigation"
          className="public-menu"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <ReferenceNav
          path={path}
          open={open}
          onNavigate={() => setOpen(false)}
        />
        <Link
          href="/business"
          className="public-business"
          aria-current={path === "/business" ? "page" : undefined}
          onClick={() => setOpen(false)}
        >
          For business <ArrowUpRight size={14} />
        </Link>
      </header>
      <main id="public-main">
        <AgeGate>{children}</AgeGate>
      </main>
      <footer className="public-footer reference-footer">
        <div className="footer-identity">
          <Link href="/" className="public-logo">
            <span>D</span>drinkarto
          </Link>
          <p>
            For the curious.
            <br />
            And the well informed.
          </p>
          <span className="footer-caption">
            REFERENCE · KNOWLEDGE · OPERATIONS
          </span>
        </div>
        <div>
          <strong>Reference library</strong>
          <Link href="/prices">State price directory</Link>
          <Link href="/recipes">Cocktail & zero-proof recipes</Link>
          <Link href="/catalogue">Product library</Link>
          <Link href="/dictionary">A–Z dictionary</Link>
          <Link href="/wines">Wine styles</Link>
          <Link href="/taste">Taste guide</Link>
          <Link href="/compare">Compare styles</Link>
          <Link href="/guides/price-sources">Sources & methodology</Link>
        </div>
        <div>
          <strong>For businesses</strong>
          <Link href="/business">Business overview</Link>
          <Link href="/pricing">ERP plans & pricing</Link>
          <Link href="/workspace">Open workspace ↗</Link>
        </div>
        <div>
          <strong>Policies & responsibility</strong>
          <Link href="/privacy">Privacy policy</Link>
          <Link href="/terms">Terms & conditions</Link>
          <Link href="/responsible-use">Responsible use & state rules</Link>
          <p>
            Independent information.
            <br />
            No online liquor sales.
          </p>
        </div>
        <div className="public-footer-bottom">
          <span>
            © 2026 Drinkarto · Educational reference for adults aged 18+.
          </span>
          <span>
            Local eligibility rules apply. Verify prices with the official
            source.
          </span>
        </div>
      </footer>
    </div>
  );
}
