import type { Config, Context } from "@netlify/functions";
import { getAdmin } from "../lib/auth.js";
import { card, coverUrl, emptyState, esc, fmtDate, page, renderBody } from "../lib/html.js";
import { getBySlug, listPublished } from "../lib/posts.js";

const html = (body: string, status = 200, cache = true) =>
  new Response(body, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Cached at the CDN until a post changes; the posts API purges the "posts" tag on every write
      ...(cache
        ? {
            "Cache-Control": "public, max-age=0, must-revalidate",
            "Netlify-CDN-Cache-Control": "public, durable, max-age=86400, stale-while-revalidate=60",
            "Netlify-Cache-Tag": "posts",
          }
        : { "Cache-Control": "private, no-store" }),
    },
  });

async function blogIndex(category?: string) {
  const list = await listPublished({ category });
  const all = category ? await listPublished() : list;
  const cats = [...new Set(all.flatMap((p) => p.categories))].sort((a, b) => a.localeCompare(b));
  const chips = cats.length
    ? `<nav class="filters" aria-label="Categories"><a href="/blog"${category ? "" : ' aria-current="page"'}>All</a>${cats
        .map((c) => `<a href="/category/${encodeURIComponent(c)}"${c === category ? ' aria-current="page"' : ""}>${esc(c)}</a>`)
        .join("")}</nav>`
    : "";
  const body = `<section class="intro">
  <p class="overline">CH 01 / ${category ? `filed under ${esc(category)}` : "posts and notes"}</p>
  <h1>${category ? esc(category) : "Blog"}</h1>
  ${chips}
</section>
${list.length ? `<div class="cards">${list.map(card).join("")}</div>` : emptyState(category ? "Nothing filed here yet." : "No posts yet. The first one airs soon.")}`;
  return page({
    title: category ? `${category} · taniacryptid blog` : "Blog · taniacryptid",
    description: "Posts and notes from taniacryptid.",
    body,
  });
}

const decode = (s = "") => {
  try { return decodeURIComponent(s); } catch { return s; }
};

export default async (req: Request, context: Context) => {
  const { pathname } = new URL(req.url);

  if (pathname === "/blog" || pathname === "/blog/") return html(await blogIndex());

  if (context.params.name) return html(await blogIndex(decode(context.params.name)));

  const post = await getBySlug(decode(context.params.slug));
  // Drafts are only visible to admins, and those views are never cached
  const isDraft = post?.status !== "published";
  const admin = isDraft ? await getAdmin() : null;
  if (!post || (isDraft && !admin)) {
    return html(page({ title: "Not found · taniacryptid", body: emptyState("That post isn’t on the air.") }), 404, false);
  }

  const body = `<article class="post">
  <a class="back" href="/blog">← All posts</a>
  ${isDraft ? `<p class="draft-flag">Draft preview — only admins can see this. <a href="/admin#edit=${post.id}">Edit</a></p>` : ""}
  ${post.categories.length ? `<p class="cats">${post.categories.map((c) => `<a class="cat" href="/category/${encodeURIComponent(c)}">${esc(c)}</a>`).join("")}</p>` : ""}
  <h1>${esc(post.title)}</h1>
  <p class="date">${isDraft ? "Not published yet" : fmtDate(post.publishedAt)}</p>
  ${post.coverImage ? `<img class="cover" src="${coverUrl(post.coverImage, "cover")}" alt="">` : ""}
  <div class="prose">${renderBody(post.body)}</div>
</article>`;

  return html(page({ title: `${post.title} · taniacryptid`, description: post.excerpt, body, admin: !!admin }), 200, !isDraft);
};

export const config: Config = {
  path: ["/blog", "/blog/", "/posts/:slug", "/category/:name"],
};
