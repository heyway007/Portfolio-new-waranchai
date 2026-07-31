// Keep password verification inside the 10 ms CPU budget on Workers Free.
// The admin password is generated with high entropy and is never stored raw.
const ITERATIONS = 100_000;
const HASH_BYTES = 32;
const ALGORITHM = "pbkdf2-sha256";

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function derive(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: salt as BufferSource,
      iterations,
    },
    key,
    HASH_BYTES * 8,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(
  password: string,
  suppliedSalt?: Uint8Array,
): Promise<string> {
  const salt = suppliedSalt ?? crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt, ITERATIONS);
  return [ALGORITHM, ITERATIONS, toBase64(salt), toBase64(hash)].join("$");
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  try {
    const [algorithm, iterationsRaw, saltRaw, expectedRaw] = stored.split("$");
    const iterations = Number(iterationsRaw);
    if (
      algorithm !== ALGORITHM ||
      !Number.isInteger(iterations) ||
      iterations < 100_000 ||
      !saltRaw ||
      !expectedRaw
    ) {
      return false;
    }
    const actual = await derive(password, fromBase64(saltRaw), iterations);
    const expected = fromBase64(expectedRaw);
    if (actual.length !== expected.length) return false;
    let difference = 0;
    for (let index = 0; index < actual.length; index += 1) {
      difference |= actual[index] ^ expected[index];
    }
    return difference === 0;
  } catch {
    return false;
  }
}
