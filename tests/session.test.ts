import { describe, expect, it } from "vitest";
import {
  buildSessionCookie,
  clearSessionCookie,
  getSessionToken,
} from "../lib/auth/session";

describe("admin session cookies", () => {
  it("sets secure cookie attributes", () => {
    const cookie = buildSessionCookie("abc123", 43_200);
    expect(cookie).toContain("portfolio_admin_session=abc123");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Secure");
    expect(cookie).toContain("SameSite=Strict");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain("Max-Age=43200");
  });

  it("reads the session token from a request", () => {
    const request = new Request("https://example.com/admin", {
      headers: {
        cookie: "theme=light; portfolio_admin_session=token-value; foo=bar",
      },
    });
    expect(getSessionToken(request)).toBe("token-value");
  });

  it("clears the session cookie", () => {
    expect(clearSessionCookie()).toContain("Max-Age=0");
  });
});
