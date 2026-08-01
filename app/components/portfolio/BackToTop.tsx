"use client";

import { useEffect, useState } from "react";

export const BACK_TO_TOP_THRESHOLD = 240;

export function shouldShowBackToTop(scrollY: number) {
  return scrollY > BACK_TO_TOP_THRESHOLD;
}

export function BackToTop({ label }: { label: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const syncVisibility = () => {
      const nextVisible = shouldShowBackToTop(window.scrollY);
      setVisible((current) => (current === nextVisible ? current : nextVisible));
    };

    syncVisibility();
    window.addEventListener("scroll", syncVisibility, { passive: true });

    return () => window.removeEventListener("scroll", syncVisibility);
  }, []);

  if (!visible) return null;

  return (
    <a className="back-to-top" href="#top" aria-label={label}>
      {label}
    </a>
  );
}
