import { marked } from "marked";
import { esc } from "./html.js";
import { list, loadPage, safeUrl, storePage, str } from "./pages.js";

// Everything on the Livestreams page that can be changed from the admin editor.
// The intro and notes accept Markdown links.
export type Livestreams = {
  tagline: string;
  intro: string;
  live: { on: boolean; title: string; url: string };              // manual "on air now" banner
  watchAt: { name: string; note: string; url: string }[];          // where I stream right now
  featured: { title: string; url: string; note: string };          // a replay; YouTube links play in the page
  listings: { start: string; title: string; where: string; url: string; note: string }[]; // start is an ISO date-time
  channels: { name: string; handle: string; url: string }[];       // my own channels
};

export const defaultLivestreams: Livestreams = {
  tagline: "Showcases, streams and the occasional 2 a.m. rerun.",
  intro: `These days I'm on air as part of my work at **Netlify**, hosting streams and showcases that put the community's work on screen. Upcoming broadcasts and replays land in the guide below.`,
  live: { on: false, title: "", url: "" },
  watchAt: [],
  featured: { title: "", url: "", note: "" },
  listings: [],
  channels: [
    { name: "YouTube", handle: "@taniacryptid", url: "https://www.youtube.com/@taniacryptid" },
    { name: "Instagram", handle: "@taniacryptid", url: "https://www.instagram.com/taniacryptid/" },
  ],
};

const isoTime = (v: unknown) => {
  const d = new Date(str(v, 40));
  return isNaN(d.getTime()) ? "" : d.toISOString();
};

// Normalise whatever the editor sends into a valid Livestreams document
export function cleanLivestreams(input: Partial<Livestreams>): Livestreams {
  const live = (input.live ?? {}) as Partial<Livestreams["live"]>;
  const f = (input.featured ?? {}) as Partial<Livestreams["featured"]>;
  return {
    tagline: str(input.tagline, 300),
    intro: str(input.intro, 10000),
    live: { on: live.on === true, title: str(live.title, 160), url: safeUrl(live.url) },
    watchAt: list<Livestreams["watchAt"][number]>(input.watchAt)
      .map((w) => ({ name: str(w?.name, 80), note: str(w?.note, 300), url: safeUrl(w?.url) }))
      .filter((w) => w.name || w.url)
      .slice(0, 12),
    featured: { title: str(f.title, 160), url: safeUrl(f.url), note: str(f.note, 1000) },
    listings: list<Livestreams["listings"][number]>(input.listings)
      .map((l) => ({ start: isoTime(l?.start), title: str(l?.title, 160), where: str(l?.where, 80), url: safeUrl(l?.url), note: str(l?.note, 500) }))
      .filter((l) => l.start && l.title)
      .slice(0, 100),
    channels: list<Livestreams["channels"][number]>(input.channels)
      .map((c) => ({ name: str(c?.name, 60), handle: str(c?.handle, 80), url: safeUrl(c?.url) }))
      .filter((c) => c.name && c.url)
      .slice(0, 12),
  };
}

export const getLivestreams = () => loadPage("livestreams", defaultLivestreams);
export const saveLivestreams = (l: Livestreams) => storePage("livestreams", l);

const md = (s: string) => marked.parse(s, { async: false }) as string;
const mdInline = (s: string) => marked.parseInline(s, { async: false }) as string;
const pad2 = (n: number) => String(n).padStart(2, "0");
const ext = (url: string) => (/^https?:/i.test(url) ? ` target="_blank" rel="noopener"` : "");

// youtube.com/watch?v=, youtu.be/, /live/, /shorts/ and /embed/ links all play in the page
export function youTubeId(url: string) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^(www|m)\./, "");
    let id = "";
    if (host === "youtu.be") id = u.pathname.slice(1);
    else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      id = u.searchParams.get("v") || (u.pathname.match(/^\/(?:live|shorts|embed)\/([^/]+)/)?.[1] ?? "");
    }
    return /^[\w-]{6,20}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

// Times are written in UTC here; a small script switches them to the visitor's own time zone
const UTC = { timeZone: "UTC" } as const;
const day = (d: Date) => d.toLocaleDateString("en-US", { ...UTC, weekday: "short", month: "short", day: "numeric" });
const clock = (d: Date) => d.toLocaleTimeString("en-US", { ...UTC, hour: "numeric", minute: "2-digit" });

// A stream counts as upcoming until two hours after it starts
const RUNTIME = 2 * 60 * 60 * 1000;

function listing(l: Livestreams["listings"][number], i: number, past: boolean) {
  const d = new Date(l.start);
  return `<li class="slot${past ? " rerun" : ""}">
        <div class="when">
          <time datetime="${l.start}" data-local="day">${day(d)}</time>
          <time datetime="${l.start}" data-local="time" class="hh">${clock(d)} UTC</time>
        </div>
        <div class="what">
          <h3>${esc(l.title)}${past ? ` <span class="tag">(R)</span>` : ""}</h3>
          ${l.where ? `<p class="where">${esc(l.where)}</p>` : ""}
          ${l.note ? `<p class="blurb">${mdInline(l.note)}</p>` : ""}
        </div>
        ${l.url ? `<a class="tune" href="${esc(l.url)}"${ext(l.url)}>${past ? "Watch replay" : "Tune in"}<span class="sr"> to ${esc(l.title)}</span></a>` : `<span class="tune off" aria-hidden="true">CH ${pad2(4 + i)}</span>`}
      </li>`;
}

export function renderLivestreams(s: Livestreams) {
  const now = Date.now();
  const sorted = [...s.listings].sort((a, b) => a.start.localeCompare(b.start));
  const upcoming = sorted.filter((l) => new Date(l.start).getTime() + RUNTIME > now);
  const past = sorted.filter((l) => new Date(l.start).getTime() + RUNTIME <= now).reverse().slice(0, 12);
  const yt = s.featured.url ? youTubeId(s.featured.url) : null;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Livestreams · taniacryptid</title>
<meta name="description" content="${esc(s.tagline || "Livestreams and showcases with taniacryptid.")}">
<meta name="theme-color" content="#120a24">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Instrument+Sans:wght@400;700&family=Shrikhand&family=VT323&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Dela+Gothic+One&text=%E3%82%BF%E3%83%8B%E3%82%A2%E6%94%BE%E9%80%81&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/livestreams.css">
</head>
<body>

<header class="masthead">
  <a class="brand" href="/">taniacryptid</a>
  <nav aria-label="Main"><a href="/blog">blog</a><a href="/about">about</a><a href="/community">community</a><a href="/livestreams" aria-current="page">livestreams</a><a href="/contact">contact</a></nav>
</header>

<header class="cover">
  <div class="bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
  <div class="cover-grid">
    <div>
      <p class="logo" aria-hidden="true"><b>tania</b> GUIDE</p>
      <p class="overline"><span class="ch">CH 04</span> Late night listings<span class="kana" aria-hidden="true">放送</span></p>
      <h1>Livestreams</h1>
      ${s.tagline ? `<p class="tagline">${esc(s.tagline)}</p>` : ""}
    </div>
    <div class="clock" aria-hidden="true">
      <span class="label-sm">Local time</span>
      <span id="clock">--:--</span>
      <span class="label-sm" id="tz">your time zone</span>
    </div>
  </div>
  ${s.live.on ? `<a class="onair" href="${esc(s.live.url || (s.featured.url ? "#watch" : "#guide-h"))}"${ext(s.live.url)}>
    <span class="lamp"></span><b>On air now</b>${s.live.title ? `<span>${esc(s.live.title)}</span>` : ""}<span class="arrow">Watch →</span>
  </a>` : ""}
</header>

<main>
  ${s.intro ? `<section class="intro">
    <div class="prose">${md(s.intro)}</div>
  </section>` : ""}

  ${s.featured.url ? `<section class="featured" id="watch" aria-labelledby="feat-h">
    <h2 id="feat-h">Featured presentation</h2>
    ${s.featured.title ? `<p class="label">${esc(s.featured.title)}</p>` : ""}
    <div class="set">
      ${yt
        ? `<div class="screen"><iframe src="https://www.youtube-nocookie.com/embed/${yt}" title="${esc(s.featured.title || "Featured stream")}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
        : `<a class="screen static" href="${esc(s.featured.url)}"${ext(s.featured.url)}><span>▶ Watch ${esc(s.featured.title || "the replay")}</span></a>`}
    </div>
    ${s.featured.note ? `<p class="feat-note">${mdInline(s.featured.note)}</p>` : ""}
  </section>` : ""}

  <section class="guide" aria-labelledby="guide-h">
    <h2 id="guide-h">Coming up</h2>
    <p class="label">All times in <span data-tzname>UTC</span></p>
    ${upcoming.length ? `<ol class="grid">
      ${upcoming.map((l, i) => listing(l, i, false)).join("\n      ")}
    </ol>` : `<div class="standby">
      <div class="bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div><p class="osdline">CH 04 / please stand by</p><p>Nothing on the schedule yet. Check back soon or catch a replay.</p></div>
    </div>`}
  </section>

  ${past.length ? `<section class="guide reruns" aria-labelledby="rerun-h">
    <h2 id="rerun-h">Reruns</h2>
    <p class="label">Past streams and showcases</p>
    <ol class="grid">
      ${past.map((l, i) => listing(l, i, true)).join("\n      ")}
    </ol>
  </section>` : ""}

  ${s.watchAt.length ? `<section class="lineup" aria-labelledby="lineup-h">
    <h2 id="lineup-h">Where I'm on air</h2>
    <p class="label">Channel lineup</p>
    <ul class="chans">
      ${s.watchAt.map((w, i) => {
        const inner = `<span class="num">${pad2(i + 4)}</span><span class="nm">${esc(w.name || w.url)}</span>${w.note ? `<span class="ds">${esc(w.note)}</span>` : ""}`;
        return `<li>${w.url ? `<a href="${esc(w.url)}"${ext(w.url)}>${inner}</a>` : `<div>${inner}</div>`}</li>`;
      }).join("\n      ")}
    </ul>
  </section>` : ""}

  ${s.channels.length ? `<section class="public" aria-labelledby="own-h">
    <h2 id="own-h">Public access</h2>
    <p class="label">My own channels, for my own stuff</p>
    <ul class="own">
      ${s.channels.map((c) => `<li><a href="${esc(c.url)}"${ext(c.url)}><b>${esc(c.name)}</b>${c.handle ? `<span>${esc(c.handle)}</span>` : ""}</a></li>`).join("\n      ")}
    </ul>
  </section>` : ""}

  <section class="signoff">
    <p class="bigline">Stay tuned.</p>
    <div class="cta">
      <a class="btn primary" href="/contact">Pitch a stream</a>
      <a class="btn" href="/">Back to the channels</a>
    </div>
  </section>
</main>

<footer>© ${new Date().getFullYear()} taniacryptid · <a href="/login">Admin log in</a></footer>
<script>
(() => {
  // switch listing times and the cover clock to the visitor's time zone
  const zone = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).formatToParts(new Date()).find(p => p.type === 'timeZoneName')?.value || 'your time zone';
  document.querySelectorAll('time[data-local]').forEach(t => {
    const d = new Date(t.getAttribute('datetime'));
    t.textContent = t.dataset.local === 'day'
      ? d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      : d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  });
  document.querySelectorAll('[data-tzname]').forEach(el => { el.textContent = 'your time zone (' + zone + ')'; });
  const c = document.getElementById('clock');
  document.getElementById('tz').textContent = zone;
  const tick = () => { c.textContent = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); };
  tick(); setInterval(tick, 15000);
})();
</script>
</body>
</html>`;
}
