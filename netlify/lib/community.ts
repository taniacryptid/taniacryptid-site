import { marked } from "marked";
import { coverUrl, esc, fmtDate } from "./html.js";
import { list, loadPage, safeUrl, storePage, str } from "./pages.js";

// Everything on the Community page that can be changed from the admin editor.
// Intro, spotlight blurb and sign-off accept Markdown.
export type Community = {
  tagline: string;
  intro: string;
  spotlight: {
    label: string;        // small line above the title, e.g. "Now showing"
    title: string;
    host: string;         // where the program runs, e.g. "Netlify"
    blurb: string;
    linkLabel: string;
    link: string;
    photo: string | null; // Blob key; null shows a still from /img/community.jpg
  };
  highlights: { kind: string; title: string; url: string; date: string; note: string }[];
  signoffTitle: string;
  signoff: string;
};

export const defaultCommunity: Community = {
  tagline: "It came from the internet… and it brought friends.",
  intro: `I build programs that help people find each other, learn out loud and show off what they make. Right now that work happens at **Netlify**, where I run community programs for developers and builders.`,
  spotlight: {
    label: "Now showing",
    title: "Community programs at Netlify",
    host: "Netlify",
    blurb: `The latest program I'm running lives here. Swap this text for a short blurb about it: who it's for, what happens, and how to get involved.`,
    linkLabel: "Learn more",
    link: "",
    photo: null,
  },
  highlights: [
    { kind: "Forums", title: "Netlify Support Forums", url: "https://answers.netlify.com", date: "", note: "Where the community helps each other out every day." },
  ],
  signoffTitle: "Join the rampage.",
  signoff: "Running something and want to team up? Want to get involved in a program? Send a signal.",
};

const isoDate = (v: unknown) => (/^\d{4}-\d{2}-\d{2}$/.test(str(v, 10)) ? str(v, 10) : "");

// Normalise whatever the editor sends into a valid Community document
export function cleanCommunity(input: Partial<Community>): Community {
  const s = (input.spotlight ?? {}) as Partial<Community["spotlight"]>;
  return {
    tagline: str(input.tagline, 300),
    intro: str(input.intro, 10000),
    spotlight: {
      label: str(s.label, 60),
      title: str(s.title, 160),
      host: str(s.host, 80),
      blurb: str(s.blurb, 10000),
      linkLabel: str(s.linkLabel, 60),
      link: safeUrl(s.link),
      photo: s.photo ? str(s.photo, 500) : null,
    },
    highlights: list<Community["highlights"][number]>(input.highlights)
      .map((h) => ({ kind: str(h?.kind, 40), title: str(h?.title, 200), url: safeUrl(h?.url), date: isoDate(h?.date), note: str(h?.note, 500) }))
      .filter((h) => h.title || h.url)
      .slice(0, 40),
    signoffTitle: str(input.signoffTitle, 120) || defaultCommunity.signoffTitle,
    signoff: str(input.signoff, 1000),
  };
}

export const getCommunity = () => loadPage("community", defaultCommunity);
export const saveCommunity = (c: Community) => storePage("community", c);

const md = (s: string) => marked.parse(s, { async: false }) as string;
const mdInline = (s: string) => marked.parseInline(s, { async: false }) as string;
const pad2 = (n: number) => String(n).padStart(2, "0");
const ext = (url: string) => /^https?:/i.test(url) ? ` target="_blank" rel="noopener"` : "";

// The roaring creature on the poster, a single flat silhouette
const KAIJU = `<svg class="kaiju" viewBox="0 0 400 440" aria-hidden="true" focusable="false">
  <g class="beast">
    <path d="M150 440C140 380 140 320 158 270c12-34 28-56 48-70l30-4c26 18 46 54 56 104 8 40 8 100 4 140Z"/>
    <path d="M286 380c34 0 64 20 114 12v28c-50 12-80 10-110 8Z"/>
    <path d="M168 226c-12-30-14-64-4-86 8-18 22-28 42-28s34 16 38 38-4 46-14 60Z"/>
    <path d="M180 124c-30-4-60-2-84 8l4 18c28 2 56 6 84 16Z"/>
    <path d="M184 178c-28 4-54 12-76 26l8 12c26-8 50-10 76-10Z"/>
    <path d="M104 150l6 10 6-9m8 1 6 10 6-9m-18 53 4-10 8 9"/>
    <path d="M176 270c-26-8-44-18-58-34l-8 8c12 22 36 38 62 46Z"/>
    <path d="M266 250c24-14 40-34 46-58l12 4c-4 30-24 56-48 74Z"/>
    <path d="M228 118l16-26 2 32Zm16 22 24-20-8 32Zm8 32 30-14-14 32Zm12 34 34-8-18 32Zm12 38 36-2-22 28Zm10 40 34 6-24 22Z"/>
  </g>
  <circle class="eye" cx="190" cy="138" r="5"/>
</svg>`;

// A row of buildings with a few lit windows, the same every time
const CITY = (() => {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  let x = 0, blocks = "", lit = "";
  while (x < 1600) {
    const w = 40 + Math.round(rnd() * 70), h = 30 + Math.round(rnd() * 80);
    blocks += `<rect x="${x}" y="${120 - h}" width="${w}" height="${h}"/>`;
    for (let wy = 120 - h + 8; wy < 110; wy += 14)
      for (let wx = x + 8; wx < x + w - 8; wx += 12) if (rnd() < 0.18) lit += `<rect x="${wx}" y="${wy}" width="4" height="6"/>`;
    x += w + Math.round(rnd() * 6);
  }
  return `<svg class="city" viewBox="0 0 1600 120" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false"><g class="blocks">${blocks}</g><g class="lit">${lit}</g></svg>`;
})();

// Six photos side by side in one image, same as channel 03 on the homepage TV
const still = (i: number) => `<span class="still" style="--i:${i}"></span>`;

export function renderCommunity(c: Community) {
  const sp = c.spotlight;
  const hasSpot = !!(sp.title || sp.blurb);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Community · taniacryptid</title>
<meta name="description" content="${esc(c.tagline || "Community programs run by taniacryptid.")}">
<meta name="theme-color" content="#04161a">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Instrument+Sans:wght@400;700&family=Shrikhand&family=VT323&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Dela+Gothic+One&text=%E3%82%BF%E3%83%8B%E3%82%A2%E6%80%AA%E7%8D%A3&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/community.css">
</head>
<body>

<header class="masthead">
  <a class="brand" href="/">taniacryptid</a>
  <nav aria-label="Main"><a href="/blog">blog</a><a href="/about">about</a><a href="/community" aria-current="page">community</a><a href="/livestreams">livestreams</a><a href="/contact">contact</a></nav>
</header>

<header class="poster">
  <div class="sky" aria-hidden="true"><span class="beam b1"></span><span class="beam b2"></span></div>
  ${KAIJU}
  ${CITY}
  <div class="poster-copy">
    <p class="overline"><span class="ch">CH 03</span> Now showing<span class="kana" aria-hidden="true">怪獣</span></p>
    <h1>Community</h1>
    ${c.tagline ? `<p class="tagline">${esc(c.tagline)}</p>` : ""}
  </div>
  <p class="billing" aria-hidden="true">
    <span>taniacryptid presents</span> a community production · starring <b>you</b> and a cast of thousands ·
    ${sp.host ? `filmed on location at <b>${esc(sp.host)}</b> ·` : ""} rated <b>F</b> for friendly
  </p>
</header>

<main>
  ${c.intro ? `<section class="intro">
    <div class="prose">${md(c.intro)}</div>
  </section>` : ""}

  ${hasSpot ? `<section class="spotlight" aria-labelledby="spot-h">
    <div class="one-sheet">
      <figure class="frame">
        ${sp.photo
          ? `<img src="${esc(coverUrl(sp.photo, "card"))}" alt="" loading="lazy">`
          : still(0)}
        ${sp.host ? `<figcaption>At ${esc(sp.host)}</figcaption>` : ""}
      </figure>
      <div class="spot-copy">
        ${sp.label ? `<p class="kicker">${esc(sp.label)}</p>` : ""}
        <h2 id="spot-h">${esc(sp.title)}</h2>
        <div class="prose">${md(sp.blurb)}</div>
        ${sp.link ? `<a class="btn primary" href="${esc(sp.link)}"${ext(sp.link)}>${esc(sp.linkLabel || "Learn more")} →</a>` : ""}
      </div>
    </div>
  </section>` : ""}

  <section class="highlights" aria-labelledby="hl-h">
    <h2 id="hl-h">Latest sightings</h2>
    <p class="label">Program highlights, newsletters and dispatches</p>
    ${c.highlights.length ? `<ol class="stubs">
      ${c.highlights.map((h, i) => {
        const inner = `<span class="no">No. ${pad2(i + 1)}</span>
          <span class="stub-body">
            ${h.kind || h.date ? `<span class="meta">${[h.kind && `<b>${esc(h.kind)}</b>`, h.date && `<time datetime="${h.date}">${fmtDate(h.date)}</time>`].filter(Boolean).join(" · ")}</span>` : ""}
            <span class="title">${esc(h.title || h.url)}</span>
            ${h.note ? `<span class="note">${esc(h.note)}</span>` : ""}
          </span>
          ${h.url ? `<span class="go" aria-hidden="true">→</span>` : ""}`;
        return `<li>${h.url ? `<a class="stub" href="${esc(h.url)}"${ext(h.url)}>${inner}</a>` : `<div class="stub">${inner}</div>`}</li>`;
      }).join("\n      ")}
    </ol>` : `<p class="none">No sightings yet. The next one is on its way.</p>`}
  </section>

  <section class="reel" aria-label="Scenes from the community">
    <div class="strip" aria-hidden="true">${[0, 1, 2, 3, 4, 5].map(still).join("")}</div>
  </section>

  <section class="signoff" aria-labelledby="bye-h">
    <h2 id="bye-h" class="bigline">${esc(c.signoffTitle)}</h2>
    ${c.signoff ? `<p>${mdInline(c.signoff)}</p>` : ""}
    <div class="cta">
      <a class="btn primary" href="/contact">Get in touch</a>
      <a class="btn" href="/">Back to the channels</a>
    </div>
  </section>
</main>

<footer>© ${new Date().getFullYear()} taniacryptid · <a href="/login">Admin log in</a></footer>
</body>
</html>`;
}
