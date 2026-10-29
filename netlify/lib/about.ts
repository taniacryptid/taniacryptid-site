import { eq } from "drizzle-orm";
import { marked } from "marked";
import { db } from "../../db/index.js";
import { pages } from "../../db/schema.js";
import { coverUrl, esc } from "./html.js";

// Everything on the About page that can be changed from the admin editor.
// Bio, directive text and log entries accept Markdown.
export type About = {
  tagline: string;
  photo: string | null;   // Blob key from /api/uploads; null shows the CRT Buddy wireframe
  heading: string;
  bio: string;
  specs: { label: string; value: string }[];
  directives: { title: string; body: string }[];
  log: string[];
  signoffTitle: string;
  signoff: string;
};

export const defaultAbout: About = {
  tagline: "Community builder and fan of stories. Sent back to make the internet friendlier.",
  photo: null,
  heading: "Target identified",
  bio: `Hi, I'm Tania. Online I go by taniacryptid: part community builder, part story obsessive, part creature that comes out after dark to rewatch old movies.

I build spaces where people show up for each other. I run community programs, host showcases and livestreams, and spend a lot of time making sure the people doing cool things get seen.

Off the clock I'm pulled toward stories of every kind: late-night creature features, 80s action sequels, cozy games, comics and anything with a good robot in it. This site is my channel for all of it.`,
  specs: [
    { label: "Designation", value: "taniacryptid" },
    { label: "Primary function", value: "Community builder" },
    { label: "Secondary function", value: "Fan of stories" },
    { label: "Companion unit", value: "CRT Buddy, model CH-03" },
    { label: "Threat level", value: "Low. Extremely friendly." },
  ],
  directives: [
    { title: "Build the community", body: "Run programs that help people find each other, learn together and ship things they're proud of. [See the programs](/community)." },
    { title: "Put people on screen", body: "Host livestreams and showcases so great work gets the spotlight it deserves. [Tune in](/livestreams)." },
    { title: "Collect good stories", body: "Watch, read and play widely, then write about what stuck. [Read the blog](/blog)." },
    { title: "Protect the vibes", body: "Keep every space kind, curious and a little bit weird. No exceptions." },
  ],
  log: [
    "Grew up on channel-surfing, rented tapes and staying up way too late for the creature feature. Still do.",
    "Learned that the best part of any story is the people you share it with. Started building places to share them.",
    "Built a little CRT friend named Buddy to keep watch over the homepage. Buddy has opinions.",
    "Current status: online, caffeinated, looking for the next great story.",
  ],
  signoffTitle: "I'll be back.",
  signoff: "Usually with a new post, a new stream or a new thing to show off. Until then, come say hello.",
};

const str = (v: unknown, max = 5000) => String(v ?? "").trim().slice(0, max);

// Normalise whatever the editor sends into a valid About document
export function cleanAbout(input: Partial<About>): About {
  const list = <T>(v: unknown) => (Array.isArray(v) ? (v as T[]) : []);
  return {
    tagline: str(input.tagline, 300),
    photo: input.photo ? str(input.photo, 500) : null,
    heading: str(input.heading, 120) || defaultAbout.heading,
    bio: str(input.bio, 20000),
    specs: list<About["specs"][number]>(input.specs)
      .map((s) => ({ label: str(s?.label, 80), value: str(s?.value, 300) }))
      .filter((s) => s.label || s.value)
      .slice(0, 20),
    directives: list<About["directives"][number]>(input.directives)
      .map((d) => ({ title: str(d?.title, 120), body: str(d?.body, 2000) }))
      .filter((d) => d.title || d.body)
      .slice(0, 12),
    log: list<string>(input.log).map((e) => str(e, 2000)).filter(Boolean).slice(0, 30),
    signoffTitle: str(input.signoffTitle, 120) || defaultAbout.signoffTitle,
    signoff: str(input.signoff, 1000),
  };
}

export async function getAbout(): Promise<About & { updatedAt: Date | null }> {
  const [row] = await db.select().from(pages).where(eq(pages.slug, "about")).limit(1);
  if (!row) return { ...defaultAbout, updatedAt: null };
  return { ...defaultAbout, ...(row.content as Partial<About>), updatedAt: row.updatedAt };
}

export async function saveAbout(about: About) {
  const now = new Date();
  const [row] = await db
    .insert(pages)
    .values({ slug: "about", content: about, updatedAt: now })
    .onConflictDoUpdate({ target: pages.slug, set: { content: about, updatedAt: now } })
    .returning();
  return { ...(row.content as About), updatedAt: row.updatedAt };
}

const md = (s: string) => marked.parse(s, { async: false }) as string;
const mdInline = (s: string) => marked.parseInline(s, { async: false }) as string;
const pad2 = (n: number) => String(n).padStart(2, "0");

export function renderAbout(a: About) {
  const target = a.photo
    ? `<figure class="target photo" id="target" data-subject="TANIACRYPTID">
        <img src="${esc(coverUrl(a.photo, "card"))}" alt="Photo of taniacryptid, seen through red machine vision">`
    : `<figure class="target" id="target" data-subject="CRT BUDDY">
        <canvas id="cv" width="120" height="150" role="img" aria-label="Pixel wireframe of CRT Buddy rotating in red machine vision"></canvas>`;
  const subject = a.photo ? "TANIACRYPTID" : "CRT BUDDY";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>About · taniacryptid</title>
<meta name="description" content="${esc(a.tagline || "About taniacryptid — community builder and fan of stories.")}">
<meta name="theme-color" content="#1a0506">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@400..800&family=Chakra+Petch:wght@500;600;700&family=Courier+Prime:wght@400;700&family=Dela+Gothic+One&family=Michroma&family=VT323&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/about.css">
</head>
<body>

<!-- liquid-metal displacement filter; JS eases the scale down so the title "reforms" on load -->
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <filter id="liquid" x="-10%" y="-20%" width="120%" height="140%">
    <feTurbulence id="turb" type="fractalNoise" baseFrequency="0.012 0.04" numOctaves="2" seed="7" result="n"/>
    <feDisplacementMap id="disp" in="SourceGraphic" in2="n" scale="140" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</svg>

<nav aria-label="Main">
  <a class="mark" href="/">tc</a>
  <ul>
    <li><a href="/blog">Blog</a></li>
    <li><a href="/about" aria-current="page">About</a></li>
    <li><a href="/community">Community</a></li>
    <li><a href="/livestreams">Livestreams</a></li>
    <li><a href="/contact">Contact</a></li>
  </ul>
</nav>

<header class="vision">
  <div class="scanbar"></div>
  <div class="hud" aria-label="Visitor scan">
    <div id="hudlines"></div>
  </div>
  <div class="title-wrap">
    <p class="overline">Unit profile · CH 02<span class="kana" aria-hidden="true">タニア</span></p>
    <h1 id="title">About</h1>
    ${a.tagline ? `<p class="tagline">${esc(a.tagline)}</p>` : ""}
  </div>
</header>

<main>
  <section aria-labelledby="who-h">
    <div class="dossier">
      ${target}
        <span class="corner tl"></span><span class="corner br"></span>
        <span class="reticle" id="ret" style="left:50%;top:42%"></span>
        <figcaption id="ro">SUBJECT: ${subject}<br>TRACKING&nbsp;&nbsp;X 050 Y 042</figcaption>
      </figure>

      <div class="profile">
        <h2 id="who-h">${esc(a.heading)}</h2>
        <p class="label">File 001 · taniacryptid</p>
        ${md(a.bio)}
        ${a.specs.length ? `<dl class="specs">
          ${a.specs.map((s) => `<dt>${esc(s.label)}</dt><dd>${esc(s.value)}</dd>`).join("\n          ")}
        </dl>` : ""}
      </div>
    </div>
  </section>

  ${a.directives.length ? `<section class="directives" aria-labelledby="dir-h">
    <h2 id="dir-h">Mission directives</h2>
    <p class="label">Core programming · Do not override</p>
    <ol class="dirs">
      ${a.directives.map((d) => `<li>
        ${d.title ? `<h3>${esc(d.title)}</h3>` : ""}
        ${d.body ? `<p>${mdInline(d.body)}</p>` : ""}
      </li>`).join("\n      ")}
    </ol>
  </section>` : ""}

  ${a.log.length ? `<section aria-labelledby="log-h">
    <h2 id="log-h">Field log</h2>
    <p class="label">Recovered from the unit's memory</p>
    <div class="log-wrap">
      <article class="note">
        <span class="stamp">Classified</span>
        ${a.log.map((e, i) => `<p><span class="entry">Entry ${pad2(i + 1)}.</span> ${mdInline(e)}</p>`).join("\n        ")}
      </article>
    </div>
  </section>` : ""}

  <section class="signoff" aria-labelledby="bye-h">
    <h2 id="bye-h" class="bigline">${esc(a.signoffTitle)}</h2>
    ${a.signoff ? `<p>${mdInline(a.signoff)}</p>` : ""}
    <div class="cta">
      <a class="btn primary" href="/contact">Say hello</a>
      <a class="btn" href="/">Back to the channels</a>
    </div>
  </section>
</main>

<footer>© 2026 taniacryptid · <a href="/">Home</a></footer>
<script src="/js/about.js"></script>
</body>
</html>`;
}
