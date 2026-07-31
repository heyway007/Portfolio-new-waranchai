import { useEffect } from "react";

type RevealEnvironment = {
  document: Pick<
    Document,
    "body" | "documentElement" | "querySelectorAll"
  >;
  matchMedia: (query: string) => Pick<MediaQueryList, "matches">;
  IntersectionObserver?: typeof IntersectionObserver;
  MutationObserver?: typeof MutationObserver;
};

function isElement(node: Node): node is Element {
  return (
    "matches" in node &&
    typeof node.matches === "function" &&
    "querySelectorAll" in node
  );
}

export function setupSectionReveal(
  environment: RevealEnvironment = {
    document,
    matchMedia: (query) => window.matchMedia(query),
    IntersectionObserver:
      typeof IntersectionObserver === "undefined"
        ? undefined
        : IntersectionObserver,
    MutationObserver:
      typeof MutationObserver === "undefined" ? undefined : MutationObserver,
  },
) {
  const elements = Array.from(
    environment.document.querySelectorAll<HTMLElement>("[data-reveal]"),
  );
  const reducedMotion = environment.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const IntersectionObserverConstructor = environment.IntersectionObserver;
  const MutationObserverConstructor = environment.MutationObserver;

  if (
    reducedMotion ||
    !IntersectionObserverConstructor ||
    !MutationObserverConstructor
  ) {
    elements.forEach((element) => element.classList.add("is-revealed"));
    return () => undefined;
  }

  const root = environment.document.documentElement;
  const registered = new WeakSet<Element>();
  root.classList.add("reveal-ready");
  const observer = new IntersectionObserverConstructor(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
  );

  const register = (element: Element) => {
    if (
      registered.has(element) ||
      element.classList.contains("is-revealed")
    ) {
      return;
    }
    registered.add(element);
    observer.observe(element);
  };

  elements.forEach(register);
  const mutationObserver = new MutationObserverConstructor((records) => {
    records.forEach((record) => {
      record.addedNodes.forEach((node) => {
        if (!isElement(node)) return;
        if (node.matches("[data-reveal]")) register(node);
        node.querySelectorAll("[data-reveal]").forEach(register);
      });
    });
  });
  mutationObserver.observe(environment.document.body, {
    childList: true,
    subtree: true,
  });

  return () => {
    mutationObserver.disconnect();
    observer.disconnect();
    root.classList.remove("reveal-ready");
  };
}

export function useSectionReveal() {
  useEffect(() => setupSectionReveal(), []);
}
