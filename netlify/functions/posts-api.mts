import { purgeCache, type Config, type Context } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { posts } from "../../db/schema.js";
import { requireAdmin } from "../lib/auth.js";
import { getById, listAll, listPublished, slugify, summary, uniqueSlug } from "../lib/posts.js";

type Input = {
  title?: string;
  slug?: string;
  excerpt?: string;
  body?: string;
  coverImage?: string | null;
  categories?: string[] | string;
  status?: string;
  publishedAt?: string | null;
};

// The editor sends a plain "YYYY-MM-DD" date. Store it at noon UTC so it shows as the same day everywhere.
function parseDate(value: unknown): Date | null | "invalid" {
  if (!value) return null;
  const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return "invalid";
  const date = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], 12));
  if (date.getUTCDate() !== +m[3]) return "invalid";
  // Allow a day of slack for time zones ahead of UTC
  if (date.getTime() > Date.now() + 36 * 3600 * 1000) return "invalid";
  return date;
}

const sameDay = (a: Date, b: Date) => a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);

function clean(input: Input) {
  const cats = Array.isArray(input.categories)
    ? input.categories
    : String(input.categories ?? "").split(",");
  return {
    title: String(input.title ?? "").trim(),
    slug: slugify(String(input.slug || input.title || "")),
    excerpt: String(input.excerpt ?? "").trim(),
    body: String(input.body ?? ""),
    coverImage: input.coverImage ? String(input.coverImage) : null,
    categories: [...new Set(cats.map((c) => String(c).trim()).filter(Boolean))],
    status: input.status === "published" ? "published" : "draft",
  };
}

// Blog pages are cached at the CDN; clear them whenever a post changes
async function purgePosts() {
  try {
    await purgeCache({ tags: ["posts"] });
  } catch (err) {
    console.error("Cache purge failed", err);
  }
}

export default async (req: Request, context: Context) => {
  const id = context.params.id ? Number(context.params.id) : null;
  if (context.params.id && !Number.isInteger(id)) return Response.json({ error: "Bad id" }, { status: 400 });

  if (req.method === "GET" && id === null) {
    const url = new URL(req.url);
    if (url.searchParams.get("all") === "1") {
      const auth = await requireAdmin();
      if (auth.error) return auth.error;
      return Response.json((await listAll()).map(summary));
    }
    const limit = Math.min(Number(url.searchParams.get("limit")) || 0, 50) || undefined;
    const category = url.searchParams.get("category") || undefined;
    return Response.json((await listPublished({ limit, category })).map(summary));
  }

  // Everything below is for the admin editor
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  if (req.method === "GET" && id !== null) {
    const post = await getById(id);
    return post ? Response.json(post) : Response.json({ error: "Not found" }, { status: 404 });
  }

  if (req.method === "POST" && id === null) {
    const input: Input = await req.json();
    const data = clean(input);
    if (!data.title) return Response.json({ error: "A title is required" }, { status: 400 });
    const chosen = parseDate(input.publishedAt);
    if (chosen === "invalid") return Response.json({ error: "Publish date must be a valid date, not in the future" }, { status: 400 });
    data.slug = await uniqueSlug(data.slug);
    const [post] = await db
      .insert(posts)
      .values({ ...data, publishedAt: chosen ?? (data.status === "published" ? new Date() : null) })
      .returning();
    await purgePosts();
    return Response.json(post, { status: 201 });
  }

  if (req.method === "PUT" && id !== null) {
    const existing = await getById(id);
    if (!existing) return Response.json({ error: "Not found" }, { status: 404 });
    const input: Input = await req.json();
    const data = clean(input);
    if (!data.title) return Response.json({ error: "A title is required" }, { status: 400 });
    const chosen = parseDate(input.publishedAt);
    if (chosen === "invalid") return Response.json({ error: "Publish date must be a valid date, not in the future" }, { status: 400 });
    data.slug = await uniqueSlug(data.slug, id);
    // A chosen date wins (keeping the original time if the day is unchanged). Otherwise keep the
    // original publish date when re-saving, and set it the first time a post goes live.
    let publishedAt: Date | null;
    if (chosen) publishedAt = existing.publishedAt && sameDay(existing.publishedAt, chosen) ? existing.publishedAt : chosen;
    else publishedAt = data.status === "published" ? existing.publishedAt ?? new Date() : existing.publishedAt;
    const [post] = await db
      .update(posts)
      .set({ ...data, publishedAt, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();
    await purgePosts();
    return Response.json(post);
  }

  if (req.method === "DELETE" && id !== null) {
    await db.delete(posts).where(eq(posts.id, id));
    await purgePosts();
    return new Response(null, { status: 204 });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: ["/api/posts", "/api/posts/:id"],
};
