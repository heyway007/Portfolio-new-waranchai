import { describe, expect, it } from "vitest";
import {
  BACK_TO_TOP_THRESHOLD,
  shouldShowBackToTop,
} from "../app/components/portfolio/BackToTop";

describe("Back to Top", () => {
  it("appears only after the visitor scrolls beyond 240px", () => {
    expect(BACK_TO_TOP_THRESHOLD).toBe(240);
    expect(shouldShowBackToTop(0)).toBe(false);
    expect(shouldShowBackToTop(240)).toBe(false);
    expect(shouldShowBackToTop(241)).toBe(true);
  });
});
