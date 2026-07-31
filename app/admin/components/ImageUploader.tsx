"use client";

import { useState } from "react";
import Image from "next/image";

export function ImageUploader({
  value,
  onChange,
}: {
  value: string;
  onChange(value: string): void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    setLoading(true);
    setError("");
    const data = new FormData();
    data.set("file", file);
    try {
      const response = await fetch("/api/admin/assets", {
        method: "POST",
        body: data,
      });
      if (response.status === 401) {
        window.location.assign("/admin/login");
        return;
      }
      const result = (await response.json()) as {
        ok: boolean;
        message?: string;
        asset?: { url: string };
      };
      if (!response.ok || !result.asset) {
        setError(result.message ?? "Upload failed.");
        return;
      }
      onChange(result.asset.url);
    } catch {
      setError("Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="image-uploader">
      {value ? (
        <Image
          src={value}
          alt=""
          width={320}
          height={240}
          unoptimized
        />
      ) : (
        <div className="image-empty">No image</div>
      )}
      <label className="admin-secondary-button">
        {loading ? "Uploading…" : "Upload image"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          disabled={loading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
          }}
        />
      </label>
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}
