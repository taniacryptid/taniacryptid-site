import { marked } from "marked";
import type { Post } from "./posts.js";

export const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const fmtDate = (d: Date | string | null) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }) : "";

// Covers are stored as Blob keys; anything with a slash is treated as a ready-made URL
export const coverUrl = (cover: string, size: "card" | "cover") =>
  cover.includes("/") ? cover : `/img/${size}/${encodeURIComponent(cover)}`;

const catLink = (c: string) => `<a class="cat" href="/category/${encodeURIComponent(c)}">${esc(c)}</a>`;

export function card(p: Post) {
  const href = `/posts/${encodeURIComponent(p.slug)}`;
  return `<article class="card">
  ${p.coverImage ? `<a class="card-cover" href="${href}" tabindex="-1" aria-hidden="true"><img src="${coverUrl(p.coverImage, "card")}" alt="" loading="lazy"></a>` : ""}
  <div class="card-body">
    ${p.categories.length ? `<p class="cats">${p.categories.map(catLink).join("")}</p>` : ""}
    <h3><a href="${href}">${esc(p.title)}</a></h3>
    <p class="date">${p.status === "published" ? fmtDate(p.publishedAt) : "Draft"}</p>
    ${p.excerpt ? `<p class="excerpt">${esc(p.excerpt)}</p>` : ""}
    <a class="more" href="${href}">Read the post →</a>
  </div>
</article>`;
}

export const emptyState = (msg: string) => `<div class="empty">
  <div class="bars" aria-hidden="true"><i style="background:#c8c8c8"></i><i style="background:#d6cf2a"></i><i style="background:#2ec4d6"></i><i style="background:#3cc24a"></i><i style="background:#c83cc8"></i><i style="background:#d6332a"></i><i style="background:#2a3cd6"></i></div>
  <div><p class="osdline">CH 01 / signal pending</p><p>${esc(msg)}</p></div>
</div>`;

export function renderBody(md: string) {
  return marked.parse(md, { async: false }) as string;
}

export function page({ title, description, body, admin }: { title: string; description?: string; body: string; admin?: boolean }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
${description ? `<meta name="description" content="${esc(description)}">` : ""}
<meta name="theme-color" content="#0d1236">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;700&family=Shrikhand&family=VT323&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/site.css">
</head>
<body>
<header class="masthead">
  <a class="brand" href="/">taniacryptid</a>
  <nav aria-label="Main"><a href="/blog">blog</a><a href="/about">about</a><a href="/community">community</a><a href="/livestreams">livestreams</a><a href="/contact">contact</a></nav>
</header>
<main class="wrap">
${body}
</main>
<footer class="foot">© ${new Date().getFullYear()} taniacryptid · <a href="${admin ? "/admin" : "/login"}">${admin ? "Admin" : "Admin log in"}</a></footer>
</body>
</html>`;
}
