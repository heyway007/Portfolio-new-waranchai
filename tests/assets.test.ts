import { describe, expect, it } from "vitest";
import {
  matchesImageSignature,
  validateImageMeta,
} from "../lib/assets/validation";

describe("image metadata validation", () => {
  it("accepts supported images under 8 MiB", () => {
    expect(validateImageMeta({ type: "image/webp", size: 1024 }).ok).toBe(true);
    expect(validateImageMeta({ type: "image/png", size: 2048 }).ok).toBe(true);
  });

  it("rejects SVG files", () => {
    expect(
      validateImageMeta({ type: "image/svg+xml", size: 1024 }).ok,
    ).toBe(false);
  });

  it("rejects images larger than 8 MiB", () => {
    expect(
      validateImageMeta({
        type: "image/jpeg",
        size: 8 * 1024 * 1024 + 1,
      }).ok,
    ).toBe(false);
  });

  it("recognizes PNG signatures and rejects mismatched bytes", () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(matchesImageSignature("image/png", png)).toBe(true);
    expect(matchesImageSignature("image/jpeg", png)).toBe(false);
  });
});
