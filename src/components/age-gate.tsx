'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const KEY = 'drinkarto-adult-confirmation-v1';
const EXEMPT_PATHS = ['/privacy', '/terms', '/responsible-use', '/pricing'];

export default function AgeGate({ children, initiallyAccepted = false }: { children: React.ReactNode; initiallyAccepted?: boolean }) {
  const path = usePathname();
  const exempt = EXEMPT_PATHS.includes(path);
  const [accepted, setAccepted] = useState(initiallyAccepted);
  const [blocked, setBlocked] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    try {
      const expiry = Number(localStorage.getItem(KEY));
      setAccepted(initiallyAccepted || expiry > Date.now());
    } catch {
      setAccepted(initiallyAccepted);
    }
  }, [initiallyAccepted]);

  useEffect(() => {
    const dialog = ref.current;
    if (exempt || accepted || !dialog || dialog.matches(':modal')) return;
    if (dialog.open) dialog.close();
    dialog.showModal();
  }, [accepted, exempt]);

  function reset() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      // Reset the in-memory state even when browser storage is unavailable.
    }
    setAccepted(false);
    setBlocked(false);
  }

  if (exempt || accepted) {
    return <>{children}<button className="age-reset" onClick={reset}>Age & access settings</button></>;
  }

  return <>
    <div className="age-gated-content" inert>{children}</div>
    <div className="age-overlay">
      <dialog ref={ref} open className="age-dialog" aria-labelledby="age-title" aria-modal="true" onCancel={(event) => event.preventDefault()}>
        <p className="public-eyebrow">WELCOME TO DRINKARTO</p>
        <h1 id="age-title">Adult access confirmation</h1>
        {blocked ? <>
          <p role="status">The liquor library is for people aged 18 and over. You can still read our privacy notice and terms.</p>
          <button className="public-button secondary" onClick={() => setBlocked(false)}>Return to age check</button>
        </> : <>
          <p>Confirm you are at least 18 to explore this educational library. Drinking and purchase laws vary by state; this check does not grant permission to buy or consume alcohol.</p>
          <form action="/access-confirmation" method="post">
            <input type="hidden" name="destination" value={path}/>
            <label className="age-confirm"><input name="adultConfirmation" type="checkbox" required /> I am 18 or older.</label>
            <button type="submit" className="public-button">Enter the library ↗</button>
          </form>
          <button className="public-text-button" onClick={() => setBlocked(true)}>I am under 18</button>
        </>}
        <p className="public-small-note">Self-declaration, not identity verification. No date of birth or ID is collected. Your choice stays in this browser for 7 days.</p>
        <div className="age-policy-links">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/responsible-use">State rules & responsible use</Link>
          <Link href="/pricing">Business software</Link>
        </div>
      </dialog>
    </div>
  </>;
}
