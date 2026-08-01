import { describe, expect, it } from "vitest";
import {
  HERO_CODE_SAMPLE,
  getVisibleCode,
  tokenizeBladeLine,
} from "../app/components/portfolio/HeroCodeEditor";

describe("hero Blade editor", () => {
  it("shows a realistic realtime Laravel stack", () => {
    expect(HERO_CODE_SAMPLE).toContain("Echo.private");
    expect(HERO_CODE_SAMPLE).toContain(".listen");
    expect(HERO_CODE_SAMPLE).toContain("$wire.refreshStats");
    expect(HERO_CODE_SAMPLE).toContain("<livewire:stats-grid");
    expect(HERO_CODE_SAMPLE).toContain("Reverb");
  });

  it("clamps typing progress to the code sample", () => {
    expect(getVisibleCode("blade", -2)).toBe("");
    expect(getVisibleCode("blade", 3)).toBe("bla");
    expect(getVisibleCode("blade", 99)).toBe("blade");
  });

  it("classifies Blade comments and realtime keywords", () => {
    expect(tokenizeBladeLine("{{-- Reverb stream --}}"))
      .toEqual([{ value: "{{-- Reverb stream --}}", kind: "comment" }]);
    expect(tokenizeBladeLine("Echo.private('dashboard')")).toEqual([
      { value: "Echo", kind: "keyword" },
      { value: ".private(", kind: "plain" },
      { value: "'dashboard'", kind: "string" },
      { value: ")", kind: "plain" },
    ]);
  });
});
