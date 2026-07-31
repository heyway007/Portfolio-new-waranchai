import { describe, expect, it } from "vitest";
import {
  inspectImage,
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

  it("reads dimensions and rejects images with an unsafe pixel count", () => {
    const png = new Uint8Array(24);
    png.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
    const view = new DataView(png.buffer);
    view.setUint32(16, 20_000);
    view.setUint32(20, 20_000);

    expect(inspectImage("image/png", png)).toEqual({
      ok: false,
      error: "Image dimensions are too large.",
    });
  });

  it("reads AVIF ispe dimensions after FullBox version and flags", () => {
    const avif = new Uint8Array(28);
    avif.set([...new TextEncoder().encode("ftypavif")], 4);
    avif.set([...new TextEncoder().encode("ispe")], 12);
    const view = new DataView(avif.buffer);
    view.setUint32(20, 1600);
    view.setUint32(24, 900);

    expect(inspectImage("image/avif", avif)).toEqual({
      ok: true,
      width: 1600,
      height: 900,
    });
  });
});
