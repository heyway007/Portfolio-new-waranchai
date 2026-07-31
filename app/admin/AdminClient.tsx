"use client";

import { useEffect, useState } from "react";
import type {
  ContentEntry,
  EntryType,
  PortfolioData,
  ProjectEntry,
} from "../../lib/content/types";
import Link from "next/link";
import { SettingsEditor } from "./components/SettingsEditor";
import { EntryListEditor } from "./components/EntryListEditor";
import { ProjectEditor } from "./components/ProjectEditor";

type Tab = "profile" | "experience" | "education" | "skills" | "projects";

const tabs: { id: Tab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
];

interface AdminApiResult {
  ok: boolean;
  message?: string;
  data?: PortfolioData;
  value?: ContentEntry;
}

async function requestJson(
  url: string,
  init?: RequestInit,
): Promise<AdminApiResult> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (response.status === 401) {
    window.location.assign("/admin/login");
    throw new Error("Your session has expired.");
  }
  const result = (await response.json()) as AdminApiResult;
  if (!response.ok) throw new Error(result.message ?? "Request failed.");
  return result;
}

export function AdminClient() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [tab, setTab] = useState<Tab>("profile");
  const [savingId, setSavingId] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      const result = await requestJson("/api/admin/content");
      if (!result.data) throw new Error("Portfolio data is unavailable.");
      setData(result.data);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load content.");
    }
  }

  useEffect(() => {
    let active = true;
    fetch("/api/admin/content")
      .then((response) => {
        if (response.status === 401) {
          window.location.assign("/admin/login");
          return null;
        }
        return response.json() as Promise<AdminApiResult>;
      })
      .then((result) => {
        if (active && result?.ok && result.data) setData(result.data);
      })
      .catch(() => {
        if (active) setError("Unable to load content.");
      });
    return () => {
      active = false;
    };
  }, []);

  function showNotice(message: string) {
    setNotice(message);
    setError("");
    window.setTimeout(() => setNotice(""), 2500);
  }

  async function saveSettings() {
    if (!data) return;
    setSavingId("settings");
    try {
      await requestJson("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify(data.settings),
      });
      showNotice("Profile saved.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Save failed.");
    } finally {
      setSavingId("");
    }
  }

  function replaceEntry(entry: ContentEntry) {
    if (!data) return;
    const key =
      entry.type === "experience"
        ? "experience"
        : entry.type === "education"
          ? "education"
          : entry.type === "skillGroup"
            ? "skillGroups"
            : "projects";
    setData({
      ...data,
      [key]: data[key].map((item) => (item.id === entry.id ? entry : item)),
    });
  }

  async function saveEntry(entry: ContentEntry) {
    setSavingId(entry.id);
    try {
      await requestJson(`/api/admin/entries/${entry.id}`, {
        method: "PUT",
        body: JSON.stringify(entry),
      });
      showNotice("Entry saved.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Save failed.");
    } finally {
      setSavingId("");
    }
  }

  async function createEntry(type: EntryType) {
    if (!data) return;
    const order =
      type === "experience"
        ? data.experience.length
        : type === "education"
          ? data.education.length
          : type === "skillGroup"
            ? data.skillGroups.length
            : data.projects.length;
    const base = {
      id: "",
      type,
      status: "draft" as const,
      sortOrder: order,
    };
    const entry: ContentEntry =
      type === "experience"
        ? {
            ...base,
            type,
            company: { en: "New company", th: "บริษัทใหม่" },
            role: { en: "Role", th: "ตำแหน่ง" },
            summary: { en: "", th: "" },
            startYear: new Date().getFullYear(),
            endYear: null,
            current: true,
          }
        : type === "education"
          ? {
              ...base,
              type,
              institution: { en: "New institution", th: "สถาบันใหม่" },
              qualification: { en: "Qualification", th: "วุฒิการศึกษา" },
              startYear: new Date().getFullYear(),
              endYear: new Date().getFullYear(),
            }
          : type === "skillGroup"
            ? {
                ...base,
                type,
                name: { en: "New skill group", th: "กลุ่มทักษะใหม่" },
                skills: ["New skill"],
              }
            : {
                ...base,
                type,
                slug: `project-${Date.now()}`,
                title: { en: "New project", th: "โปรเจกต์ใหม่" },
                summary: { en: "Project summary", th: "สรุปโปรเจกต์" },
                body: { en: "", th: "" },
                role: { en: "Full-Stack Developer", th: "นักพัฒนา Full-Stack" },
                technologies: ["Technology"],
                liveUrl: "",
                coverImage: "",
                imageAlt: { en: "", th: "" },
                featured: false,
              };
    try {
      const result = await requestJson("/api/admin/entries", {
        method: "POST",
        body: JSON.stringify(entry),
      });
      if (!result.value) throw new Error("Created entry is unavailable.");
      const created = result.value;
      setData({
        ...data,
        experience:
          created.type === "experience"
            ? [...data.experience, created]
            : data.experience,
        education:
          created.type === "education" ? [...data.education, created] : data.education,
        skillGroups:
          created.type === "skillGroup"
            ? [...data.skillGroups, created]
            : data.skillGroups,
        projects:
          created.type === "project" ? [...data.projects, created] : data.projects,
      });
      showNotice("Draft created.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Create failed.");
    }
  }

  async function deleteEntry(entry: ContentEntry) {
    if (!data || !window.confirm("Delete this entry? This cannot be undone.")) return;
    try {
      await requestJson(`/api/admin/entries/${entry.id}`, {
        method: "DELETE",
        body: JSON.stringify({ confirm: true }),
      });
      setData({
        ...data,
        experience: data.experience.filter((item) => item.id !== entry.id),
        education: data.education.filter((item) => item.id !== entry.id),
        skillGroups: data.skillGroups.filter((item) => item.id !== entry.id),
        projects: data.projects.filter((item) => item.id !== entry.id),
      });
      showNotice("Entry deleted.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Delete failed.");
    }
  }

  async function moveEntry(type: EntryType, index: number, direction: -1 | 1) {
    if (!data) return;
    const key =
      type === "experience"
        ? "experience"
        : type === "education"
          ? "education"
          : type === "skillGroup"
            ? "skillGroups"
            : "projects";
    const list = [...data[key]] as ContentEntry[];
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= list.length) return;
    [list[index], list[nextIndex]] = [list[nextIndex], list[index]];
    const reordered = list.map((entry, sortOrder) => ({ ...entry, sortOrder }));
    setData({ ...data, [key]: reordered });
    try {
      await requestJson("/api/admin/reorder", {
        method: "POST",
        body: JSON.stringify({
          type,
          orderedIds: reordered.map((entry) => entry.id),
        }),
      });
      showNotice("Order updated.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Reorder failed.");
      await load();
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/admin/login");
  }

  if (!data) {
    return (
      <main className="admin-loading">
        <div>
          <span className="brand-mark">W</span>
          <p>{error || "Loading portfolio…"}</p>
          {error ? (
            <button className="admin-primary-button" onClick={() => void load()}>
              Retry
            </button>
          ) : null}
        </div>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="login-brand" href="/">
          <span className="brand-mark">W</span>
          <span>Portfolio CMS</span>
        </Link>
        <nav aria-label="Admin sections">
          {tabs.map((item) => (
            <button
              key={item.id}
              className={tab === item.id ? "is-active" : ""}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-actions">
          <a href="/preview" target="_blank">
            Preview drafts ↗
          </a>
          <button onClick={() => void logout()}>Sign out</button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <p>Waranchai Portfolio</p>
            <span>Content workspace</span>
          </div>
          <a href="/" target="_blank">
            View site ↗
          </a>
        </header>
        <div className="admin-content">
          {tab === "profile" ? (
            <SettingsEditor
              value={data.settings}
              saving={savingId === "settings"}
              onChange={(settings) => setData({ ...data, settings })}
              onSave={() => void saveSettings()}
            />
          ) : null}
          {tab === "experience" ? (
            <EntryListEditor
              eyebrow="Career"
              title="Experience"
              entries={data.experience}
              savingId={savingId}
              onChange={(entry) => replaceEntry(entry)}
              onSave={(entry) => void saveEntry(entry)}
              onCreate={() => void createEntry("experience")}
              onDelete={(entry) => void deleteEntry(entry)}
              onMove={(index, direction) =>
                void moveEntry("experience", index, direction)
              }
            />
          ) : null}
          {tab === "education" ? (
            <EntryListEditor
              eyebrow="Academic"
              title="Education"
              entries={data.education}
              savingId={savingId}
              onChange={(entry) => replaceEntry(entry)}
              onSave={(entry) => void saveEntry(entry)}
              onCreate={() => void createEntry("education")}
              onDelete={(entry) => void deleteEntry(entry)}
              onMove={(index, direction) =>
                void moveEntry("education", index, direction)
              }
            />
          ) : null}
          {tab === "skills" ? (
            <EntryListEditor
              eyebrow="Capabilities"
              title="Skill groups"
              entries={data.skillGroups}
              savingId={savingId}
              onChange={(entry) => replaceEntry(entry)}
              onSave={(entry) => void saveEntry(entry)}
              onCreate={() => void createEntry("skillGroup")}
              onDelete={(entry) => void deleteEntry(entry)}
              onMove={(index, direction) =>
                void moveEntry("skillGroup", index, direction)
              }
            />
          ) : null}
          {tab === "projects" ? (
            <ProjectEditor
              projects={data.projects}
              savingId={savingId}
              onChange={(entry) => replaceEntry(entry as ProjectEntry)}
              onSave={(entry) => void saveEntry(entry)}
              onCreate={() => void createEntry("project")}
              onDelete={(entry) => void deleteEntry(entry)}
              onMove={(index, direction) =>
                void moveEntry("project", index, direction)
              }
            />
          ) : null}
        </div>
      </div>
      <div className="admin-notices" aria-live="polite">
        {notice ? <p className="notice-success">{notice}</p> : null}
        {error ? <p className="notice-error">{error}</p> : null}
      </div>
    </main>
  );
}
