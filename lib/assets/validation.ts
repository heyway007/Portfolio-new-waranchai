const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export function validateImageMeta({
  type,
  size,
}: {
  type: string;
  size: number;
}):
  | { ok: true; extension: string }
  | { ok: false; error: string } {
  if (!IMAGE_TYPES.has(type)) {
    return {
      ok: false,
      error: "Use a JPEG, PNG, WebP, or AVIF image.",
    };
  }
  if (!Number.isFinite(size) || size <= 0 || size > MAX_IMAGE_BYTES) {
    return {
      ok: false,
      error: "Images must be smaller than 8 MiB.",
    };
  }
  const extension =
    type === "image/jpeg" ? "jpg" : type.slice("image/".length);
  return { ok: true, extension };
}

export function matchesImageSignature(
  type: string,
  bytes: Uint8Array,
): boolean {
  if (type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (type === "image/png") {
    return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
      (value, index) => bytes[index] === value,
    );
  }
  if (type === "image/webp") {
    const label = String.fromCharCode(...bytes.slice(0, 12));
    return label.startsWith("RIFF") && label.endsWith("WEBP");
  }
  if (type === "image/avif") {
    const label = String.fromCharCode(...bytes.slice(4, 12));
    return label === "ftypavif" || label === "ftypavis";
  }
  return false;
}
