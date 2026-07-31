"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = (await response.json()) as {
        ok: boolean;
        message?: string;
      };
      if (!response.ok) {
        setMessage(result.message ?? "Unable to sign in.");
        return;
      }
      window.location.assign("/admin");
    } catch {
      setMessage("Unable to reach the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login">
      <Link className="admin-back-link" href="/">
        ← Back to portfolio
      </Link>
      <section className="login-card">
        <div className="login-brand">
          <span className="brand-mark">W</span>
          <span>Waranchai Portfolio</span>
        </div>
        <p className="eyebrow">Private workspace</p>
        <h1>Welcome back.</h1>
        <p className="login-intro">
          Sign in to update portfolio content, images, and publishing status.
        </p>
        <form onSubmit={submit}>
          <label>
            Email
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {message ? (
            <p className="form-error" role="alert">
              {message}
            </p>
          ) : null}
          <button className="admin-primary-button" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
