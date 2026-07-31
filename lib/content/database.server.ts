import { defaultPortfolio } from "./default-portfolio";
import { portfolioFromRows, type ContentRow } from "./repository";
import type {
  ContentEntry,
  EntryType,
  PortfolioData,
  SiteSettings,
} from "./types";

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS site_settings (
    id TEXT PRIMARY KEY,
    payload TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS content_entries (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    slug TEXT,
    payload TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS content_entries_public_idx
    ON content_entries (type, status, sort_order)`,
  `CREATE TABLE IF NOT EXISTS admin_sessions (
    token_hash TEXT PRIMARY KEY,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS admin_sessions_expiry_idx
    ON admin_sessions (expires_at)`,
  `CREATE TABLE IF NOT EXISTS login_attempts (
    attempt_key TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 0,
    window_started_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    storage_key TEXT NOT NULL UNIQUE,
    filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    alt_en TEXT NOT NULL DEFAULT '',
    alt_th TEXT NOT NULL DEFAULT '',
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS assets_storage_key_idx ON assets (storage_key)`,
];

export async function ensureDatabase(db: D1Database): Promise<void> {
  await db.batch(schemaStatements.map((statement) => db.prepare(statement)));
}

export async function ensureSeedData(db: D1Database): Promise<void> {
  await ensureDatabase(db);
  const existing = await db
    .prepare("SELECT id FROM site_settings WHERE id = ? LIMIT 1")
    .bind("primary")
    .first<{ id: string }>();
  if (existing) return;

  const now = Date.now();
  const entries: ContentEntry[] = [
    ...defaultPortfolio.experience,
    ...defaultPortfolio.education,
    ...defaultPortfolio.skillGroups,
    ...defaultPortfolio.projects,
  ];
  const statements = [
    db
      .prepare(
        "INSERT OR IGNORE INTO site_settings (id, payload, updated_at) VALUES (?, ?, ?)",
      )
      .bind("primary", JSON.stringify(defaultPortfolio.settings), now),
    ...entries.map((entry) =>
      db
        .prepare(
          `INSERT OR IGNORE INTO content_entries
            (id, type, slug, payload, status, sort_order, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          entry.id,
          entry.type,
          entry.type === "project" ? entry.slug : null,
          JSON.stringify(entry),
          entry.status,
          entry.sortOrder,
          now,
          now,
        ),
    ),
  ];
  await db.batch(statements);
}

export async function loadPortfolio(
  db: D1Database,
  includeDrafts: boolean,
): Promise<PortfolioData> {
  await ensureSeedData(db);
  const settings = await db
    .prepare("SELECT payload FROM site_settings WHERE id = ? LIMIT 1")
    .bind("primary")
    .first<{ payload: string }>();
  const statement = includeDrafts
    ? db.prepare(
        "SELECT id, type, payload, status, sort_order FROM content_entries ORDER BY type, sort_order",
      )
    : db
        .prepare(
          "SELECT id, type, payload, status, sort_order FROM content_entries WHERE status = ? ORDER BY type, sort_order",
        )
        .bind("published");
  const result = await statement.all<ContentRow>();
  return portfolioFromRows(
    settings?.payload ?? null,
    result.results ?? [],
    includeDrafts,
  );
}

export async function saveSettings(
  db: D1Database,
  settings: SiteSettings,
): Promise<void> {
  await ensureSeedData(db);
  await db
    .prepare(
      `INSERT INTO site_settings (id, payload, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at`,
    )
    .bind("primary", JSON.stringify(settings), Date.now())
    .run();
}

export async function createContentEntry(
  db: D1Database,
  entry: ContentEntry,
): Promise<void> {
  await ensureSeedData(db);
  const now = Date.now();
  await db
    .prepare(
      `INSERT INTO content_entries
        (id, type, slug, payload, status, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      entry.id,
      entry.type,
      entry.type === "project" ? entry.slug : null,
      JSON.stringify(entry),
      entry.status,
      entry.sortOrder,
      now,
      now,
    )
    .run();
}

export async function updateContentEntry(
  db: D1Database,
  id: string,
  entry: ContentEntry,
): Promise<boolean> {
  await ensureSeedData(db);
  const result = await db
    .prepare(
      `UPDATE content_entries
       SET slug = ?, payload = ?, status = ?, sort_order = ?, updated_at = ?
       WHERE id = ? AND type = ?`,
    )
    .bind(
      entry.type === "project" ? entry.slug : null,
      JSON.stringify({ ...entry, id }),
      entry.status,
      entry.sortOrder,
      Date.now(),
      id,
      entry.type,
    )
    .run();
  return Boolean(result.meta.changes);
}

export async function deleteContentEntry(
  db: D1Database,
  id: string,
): Promise<boolean> {
  await ensureSeedData(db);
  const result = await db
    .prepare("DELETE FROM content_entries WHERE id = ?")
    .bind(id)
    .run();
  return Boolean(result.meta.changes);
}

export async function reorderContentEntries(
  db: D1Database,
  type: EntryType,
  orderedIds: string[],
): Promise<void> {
  await ensureSeedData(db);
  const existing = await db
    .prepare(
      "SELECT id FROM content_entries WHERE type = ? ORDER BY sort_order",
    )
    .bind(type)
    .all<{ id: string }>();
  const existingIds = (existing.results ?? []).map((row) => row.id).sort();
  const requestedIds = [...orderedIds].sort();
  if (
    existingIds.length !== requestedIds.length ||
    existingIds.some((id, index) => id !== requestedIds[index])
  ) {
    throw new Error("Order must include every entry exactly once.");
  }
  const now = Date.now();
  await db.batch(
    orderedIds.map((id, sortOrder) =>
      db
        .prepare(
          "UPDATE content_entries SET sort_order = ?, updated_at = ? WHERE id = ? AND type = ?",
        )
        .bind(sortOrder, now, id, type),
    ),
  );
}
