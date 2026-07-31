import { describe, expect, it } from "vitest";
import {
  hashPassword,
  verifyPassword,
} from "../lib/auth/password";

const salt = new Uint8Array([
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
]);

describe("password hashing", () => {
  it("accepts the matching password", async () => {
    const stored = await hashPassword("correct horse battery staple", salt);
    await expect(
      verifyPassword("correct horse battery staple", stored),
    ).resolves.toBe(true);
  });

  it("rejects a different password", async () => {
    const stored = await hashPassword("correct horse battery staple", salt);
    await expect(verifyPassword("wrong password", stored)).resolves.toBe(false);
  });

  it("rejects malformed stored values", async () => {
    await expect(verifyPassword("password", "not-a-hash")).resolves.toBe(false);
  });
});

