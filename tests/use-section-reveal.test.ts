import { describe, expect, it } from "vitest";

class FakeClassList {
  private readonly values = new Set<string>();

  add(value: string) {
    this.values.add(value);
  }

  remove(value: string) {
    this.values.delete(value);
  }

  contains(value: string) {
    return this.values.has(value);
  }
}

class FakeElement {
  readonly classList = new FakeClassList();

  constructor(
    private readonly reveal = true,
    private readonly descendants: FakeElement[] = [],
  ) {}

  matches(selector: string) {
    return selector === "[data-reveal]" && this.reveal;
  }

  querySelectorAll(selector: string) {
    return selector === "[data-reveal]" ? this.descendants : [];
  }
}

type IntersectionEntry = {
  isIntersecting: boolean;
  target: FakeElement;
};

class FakeIntersectionObserver {
  static instance: FakeIntersectionObserver | undefined;
  readonly observed = new Set<FakeElement>();
  disconnected = false;

  constructor(
    private readonly callback: (entries: IntersectionEntry[]) => void,
  ) {
    FakeIntersectionObserver.instance = this;
  }

  observe(element: FakeElement) {
    this.observed.add(element);
  }

  unobserve(element: FakeElement) {
    this.observed.delete(element);
  }

  disconnect() {
    this.disconnected = true;
    this.observed.clear();
  }

  intersect(element: FakeElement) {
    this.callback([{ isIntersecting: true, target: element }]);
  }
}

type MutationRecord = { addedNodes: FakeElement[] };

class FakeMutationObserver {
  static instance: FakeMutationObserver | undefined;
  disconnected = false;
  observedTarget: FakeElement | undefined;
  observedOptions: unknown;

  constructor(
    private readonly callback: (records: MutationRecord[]) => void,
  ) {
    FakeMutationObserver.instance = this;
  }

  observe(target: FakeElement, options: unknown) {
    this.observedTarget = target;
    this.observedOptions = options;
  }

  disconnect() {
    this.disconnected = true;
  }

  add(...nodes: FakeElement[]) {
    this.callback([{ addedNodes: nodes }]);
  }
}

function createEnvironment({
  initial = [],
  reducedMotion = false,
  observers = true,
}: {
  initial?: FakeElement[];
  reducedMotion?: boolean;
  observers?: boolean;
} = {}) {
  const root = new FakeElement(false);
  const body = new FakeElement(false);

  return {
    root,
    body,
    environment: {
      document: {
        documentElement: root,
        body,
        querySelectorAll: () => initial,
      },
      matchMedia: () => ({ matches: reducedMotion }),
      IntersectionObserver: observers
        ? FakeIntersectionObserver
        : undefined,
      MutationObserver: observers ? FakeMutationObserver : undefined,
    },
  };
}

describe("section reveal lifecycle", () => {
  it("registers reveal nodes inserted after setup and reveals each node once", async () => {
    const hookModule: Record<string, unknown> = await import(
      "../app/components/portfolio/useSectionReveal"
    );
    const setupSectionReveal = hookModule.setupSectionReveal;
    expect(typeof setupSectionReveal).toBe("function");
    if (typeof setupSectionReveal !== "function") return;

    const initial = new FakeElement();
    const nested = new FakeElement();
    const wrapper = new FakeElement(false, [nested]);
    const direct = new FakeElement();
    const { root, body, environment } = createEnvironment({ initial: [initial] });
    const cleanup = setupSectionReveal(environment) as () => void;
    const intersection = FakeIntersectionObserver.instance;
    const mutation = FakeMutationObserver.instance;

    expect(root.classList.contains("reveal-ready")).toBe(true);
    expect(intersection?.observed).toEqual(new Set([initial]));
    expect(mutation?.observedTarget).toBe(body);
    expect(mutation?.observedOptions).toEqual({ childList: true, subtree: true });

    mutation?.add(wrapper, direct);
    expect(intersection?.observed).toEqual(new Set([initial, nested, direct]));

    intersection?.intersect(nested);
    expect(nested.classList.contains("is-revealed")).toBe(true);
    expect(intersection?.observed.has(nested)).toBe(false);

    mutation?.add(nested);
    expect(intersection?.observed.has(nested)).toBe(false);

    cleanup();
    expect(intersection?.disconnected).toBe(true);
    expect(mutation?.disconnected).toBe(true);
    expect(root.classList.contains("reveal-ready")).toBe(false);
  });

  it.each([
    { label: "reduced motion", reducedMotion: true, observers: true },
    { label: "missing observers", reducedMotion: false, observers: false },
  ])("keeps content visible with $label", async ({ reducedMotion, observers }) => {
    const hookModule: Record<string, unknown> = await import(
      "../app/components/portfolio/useSectionReveal"
    );
    const setupSectionReveal = hookModule.setupSectionReveal;
    expect(typeof setupSectionReveal).toBe("function");
    if (typeof setupSectionReveal !== "function") return;

    const initial = new FakeElement();
    const { root, environment } = createEnvironment({
      initial: [initial],
      reducedMotion,
      observers,
    });
    const cleanup = setupSectionReveal(environment) as () => void;

    expect(initial.classList.contains("is-revealed")).toBe(true);
    expect(root.classList.contains("reveal-ready")).toBe(false);
    cleanup();
  });
});
