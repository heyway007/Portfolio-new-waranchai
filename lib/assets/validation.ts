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

const MAX_IMAGE_DIMENSION = 12_000;
const MAX_IMAGE_PIXELS = 40_000_000;

function readUint24LittleEndian(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);
}

function jpegDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = bytes[offset + 1];
    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }
    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (length < 2 || offset + length + 2 > bytes.length) return null;
    if (
      marker >= 0xc0 &&
      marker <= 0xc3 &&
      marker !== 0xc4
    ) {
      return {
        height: (bytes[offset + 5] << 8) | bytes[offset + 6],
        width: (bytes[offset + 7] << 8) | bytes[offset + 8],
      };
    }
    offset += length + 2;
  }
  return null;
}

function webpDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  const chunk = String.fromCharCode(...bytes.slice(12, 16));
  if (chunk === "VP8X" && bytes.length >= 30) {
    return {
      width: readUint24LittleEndian(bytes, 24) + 1,
      height: readUint24LittleEndian(bytes, 27) + 1,
    };
  }
  if (chunk === "VP8 " && bytes.length >= 30) {
    return {
      width: (bytes[26] | (bytes[27] << 8)) & 0x3fff,
      height: (bytes[28] | (bytes[29] << 8)) & 0x3fff,
    };
  }
  if (chunk === "VP8L" && bytes.length >= 25 && bytes[20] === 0x2f) {
    return {
      width: 1 + (((bytes[22] & 0x3f) << 8) | bytes[21]),
      height:
        1 +
        (((bytes[24] & 0x0f) << 10) |
          (bytes[23] << 2) |
          ((bytes[22] & 0xc0) >> 6)),
    };
  }
  return null;
}

function avifDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  for (let offset = 4; offset + 16 <= bytes.length; offset += 1) {
    if (
      bytes[offset] === 0x69 &&
      bytes[offset + 1] === 0x73 &&
      bytes[offset + 2] === 0x70 &&
      bytes[offset + 3] === 0x65
    ) {
      const view = new DataView(bytes.buffer, bytes.byteOffset + offset + 8, 8);
      return { width: view.getUint32(0), height: view.getUint32(4) };
    }
  }
  return null;
}

export function inspectImage(
  type: string,
  bytes: Uint8Array,
):
  | { ok: true; width: number; height: number }
  | { ok: false; error: string } {
  if (!matchesImageSignature(type, bytes)) {
    return { ok: false, error: "The file content does not match its image type." };
  }

  let dimensions: { width: number; height: number } | null = null;
  if (type === "image/png" && bytes.length >= 24) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    dimensions = { width: view.getUint32(16), height: view.getUint32(20) };
  } else if (type === "image/jpeg") {
    dimensions = jpegDimensions(bytes);
  } else if (type === "image/webp") {
    dimensions = webpDimensions(bytes);
  } else if (type === "image/avif") {
    dimensions = avifDimensions(bytes);
  }

  if (!dimensions || dimensions.width <= 0 || dimensions.height <= 0) {
    return { ok: false, error: "Unable to read image dimensions." };
  }
  if (
    dimensions.width > MAX_IMAGE_DIMENSION ||
    dimensions.height > MAX_IMAGE_DIMENSION ||
    dimensions.width * dimensions.height > MAX_IMAGE_PIXELS
  ) {
    return { ok: false, error: "Image dimensions are too large." };
  }
  return { ok: true, ...dimensions };
}
