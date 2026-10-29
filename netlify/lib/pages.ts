import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { pages } from "../../db/schema.js";

// Load an editable page's content, filling in anything missing from its defaults
export async function loadPage<T extends object>(slug: string, defaults: T): Promise<T & { updatedAt: Date | null }> {
  const [row] = await db.select().from(pages).where(eq(pages.slug, slug)).limit(1);
  if (!row) return { ...defaults, updatedAt: null };
  return { ...defaults, ...(row.content as Partial<T>), updatedAt: row.updatedAt };
}

export async function storePage<T extends object>(slug: string, content: T): Promise<T & { updatedAt: Date }> {
  const now = new Date();
  const [row] = await db
    .insert(pages)
    .values({ slug, content, updatedAt: now })
    .onConflictDoUpdate({ target: pages.slug, set: { content, updatedAt: now } })
    .returning();
  return { ...(row.content as T), updatedAt: row.updatedAt };
}

// Helpers for cleaning what the admin editor sends
export const str = (v: unknown, max = 5000) => String(v ?? "").trim().slice(0, max);
export const list = <T>(v: unknown) => (Array.isArray(v) ? (v as T[]) : []);
// Only allow http(s), mailto and site-relative links
export const safeUrl = (v: unknown) => {
  const s = str(v, 1000);
  return /^(https?:\/\/|mailto:|\/(?!\/))/i.test(s) ? s : "";
};

// Same CDN caching for every editable page; saving it purges the page's tag
export const pageHeaders = (tag: string, maxAge = 86400) => ({
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "public, max-age=0, must-revalidate",
  "Netlify-CDN-Cache-Control": `public, durable, max-age=${maxAge}, stale-while-revalidate=60`,
  "Netlify-Cache-Tag": tag,
});
