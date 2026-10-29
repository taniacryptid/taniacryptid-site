import { and, arrayContains, desc, eq, ne, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { posts, type Post } from "../../db/schema.js";

export type { Post };

export function slugify(input: string) {
  return (
    input
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "post"
  );
}

// Make a slug unique by appending -2, -3, ... when another post already uses it.
export async function uniqueSlug(base: string, ignoreId?: number) {
  let slug = base;
  for (let n = 2; ; n++) {
    const clash = await db
      .select({ id: posts.id })
      .from(posts)
      .where(ignoreId ? and(eq(posts.slug, slug), ne(posts.id, ignoreId)) : eq(posts.slug, slug))
      .limit(1);
    if (!clash.length) return slug;
    slug = `${base}-${n}`;
  }
}

export function listPublished({ category, limit }: { category?: string; limit?: number } = {}) {
  const where = category
    ? and(eq(posts.status, "published"), arrayContains(posts.categories, [category]))
    : eq(posts.status, "published");
  const q = db.select().from(posts).where(where).orderBy(desc(posts.publishedAt));
  return limit ? q.limit(limit) : q;
}

export function listAll() {
  return db.select().from(posts).orderBy(desc(sql`coalesce(${posts.publishedAt}, ${posts.createdAt})`));
}

export async function getBySlug(slug: string) {
  const [post] = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);
  return post ?? null;
}

export async function getById(id: number) {
  const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return post ?? null;
}

// Fields shown publicly in lists (leave the full body out)
export const summary = (p: Post) => ({
  id: p.id,
  slug: p.slug,
  title: p.title,
  excerpt: p.excerpt,
  coverImage: p.coverImage,
  categories: p.categories,
  status: p.status,
  publishedAt: p.publishedAt,
  updatedAt: p.updatedAt,
});
