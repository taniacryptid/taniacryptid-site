# Tania Cryptid — Typography Style Guide

Oct 28, 2026 · @Tania Chakraborty

## Brand mood

taniacryptid type should feel like a late-night double feature on channel 3: a kaiju poster on the marquee, an action-movie title slammed across the screen, and a killer-robot HUD readout in the corner.

- **Kaiju poster:** heavy, blocky letters with Japanese-poster energy, printed mustard on red.
- **80s action title:** tall, condensed, all-caps type with chrome or a hard drop shadow.
- **Cyborg HUD / CRT:** monospaced, scanline-friendly readouts — matches the site's existing ON AIR, NOW SHOWING and CH 03 broadcast language and CRT Buddy.
- **Technicolor print:** saturated, slightly warm color with flat fills and offset shadows, like misregistered poster ink.

The site already uses a broadcast metaphor and a deep navy theme color (#0d1236). This guide keeps both and adds the poster layer on top, so it can flex as the site keeps changing.

## The system at a glance

Six roles, each with one job. Display and Action carry the personality; Body stays calm so the loud stuff reads as loud.

| Role | Font | Job | Where it shows up |
| --- | --- | --- | --- |
| Marquee | Dela Gothic One | The kaiju poster voice | Site name, hero titles, one word per screen |
| Action | Anton | The 80s action-title voice | Section headings (BLOG, PROJECTS), big callouts |
| Steel | Michroma | Wide, steel-plate cyborg lettering | CLASSIFIED badges, warnings, stamped labels — sparingly |
| Signal | Chakra Petch (labels) + VT323 (screen text) | Cyborg targeting HUD and CRT readout | ON AIR, NOW SHOWING, channel labels; VT323 for CRT Buddy UI and tickers |
| Body | Archivo | Readable, warm, a little condensed | Main paragraphs, captions, buttons |
| Notes | Courier Prime + Caveat | The paper layer | Notes, logs, index cards; Caveat only for short scribbles |

Code blocks use Share Tech Mono so they stay crisp at small sizes, where VT323 gets fuzzy.

## Font picks and alternates

Every font here is free on Google Fonts, so it loads on Netlify with one link tag and no licensing worries.

| Role | Primary | Why it fits | Swap in for a different mood |
| --- | --- | --- | --- |
| Marquee | [Dela Gothic One](https://fonts.google.com/specimen/Dela+Gothic+One) | Ultra-heavy Japanese poster face; includes katakana, so you can set タニア next to TANIA | [Bungee](https://fonts.google.com/specimen/Bungee) for a neon-sign marquee; [Rubik Mono One](https://fonts.google.com/specimen/Rubik+Mono+One) for flatter 90s blocks |
| Action | [Anton](https://fonts.google.com/specimen/Anton) | Tall, condensed, all-caps — the shape of a sequel title | [Bebas Neue](https://fonts.google.com/specimen/Bebas+Neue) lighter; [Big Shoulders Display](https://fonts.google.com/specimen/Big+Shoulders+Display) with a Black weight for more muscle |
| Steel | [Michroma](https://fonts.google.com/specimen/Michroma) | Very wide and stretched, like lettering stamped into a steel plate | [Orbitron](https://fonts.google.com/specimen/Orbitron) sleeker chrome sci-fi; [Russo One](https://fonts.google.com/specimen/Russo+One) chunkier military |
| Signal labels | [Chakra Petch](https://fonts.google.com/specimen/Chakra+Petch) | Cut-off corners read as a robot's targeting display | [Oxanium](https://fonts.google.com/specimen/Oxanium) rounder; [Audiowide](https://fonts.google.com/specimen/Audiowide) more arcade |
| Signal screen | [VT323](https://fonts.google.com/specimen/VT323) | Real terminal bitmap look; pairs with CRT Buddy's chunky pixels | [Share Tech Mono](https://fonts.google.com/specimen/Share+Tech+Mono) for a cold, clean HUD |
| Body | [Archivo](https://fonts.google.com/specimen/Archivo) | Variable width axis: normal for reading, condensed to echo Anton | [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) quirkier; [IBM Plex Sans](https://fonts.google.com/specimen/IBM+Plex+Sans) more technical |
| Notes | [Courier Prime](https://fonts.google.com/specimen/Courier+Prime) | A typewriter face redrawn for screens; readable in long notes | [Special Elite](https://fonts.google.com/specimen/Special+Elite) worn and smudgy, for stamped labels only |
| Scribbles | [Caveat](https://fonts.google.com/specimen/Caveat) | Quick handwriting for margin notes and arrows | [Kalam](https://fonts.google.com/specimen/Kalam) neater; [Permanent Marker](https://fonts.google.com/specimen/Permanent+Marker) for Sharpie energy |
| Code | [Share Tech Mono](https://fonts.google.com/specimen/Share+Tech+Mono) | Sharp, narrow, readable at 14px | [Space Mono](https://fonts.google.com/specimen/Space+Mono) for a rounder retro feel |

When the site changes direction, swap one row at a time. Changing Marquee alone shifts the whole mood; Body should rarely change.

## Type scale

Sizes use clamp() so they shrink on phones and grow on wide screens; the range below is min → max. Base body size is 18px.

| Token | Font | Size (px) | Weight | Case | Letter-spacing | Line-height |
| --- | --- | --- | --- | --- | --- | --- |
| --t-marquee | Dela Gothic One | 56 → 144 | 400 (only weight) | UPPER | -0.02em | 0.9 |
| --t-h1 | Anton | 44 → 88 | 400 | UPPER | 0.01em | 0.95 |
| --t-h2 | Anton | 32 → 56 | 400 | UPPER | 0.02em | 1.0 |
| --t-h3 | Archivo, condensed | 22 → 28 | 800 | Title | 0 | 1.15 |
| --t-steel | Michroma | 14 → 22 | 400 (only weight) | UPPER | 0.15em | 1.2 |
| --t-label | Chakra Petch | 16 → 28 | 600 | UPPER | 0.12em | 1.1 |
| --t-signal | VT323 | 20 → 28 | 400 | UPPER | 0.06em | 1.1 |
| --t-body | Archivo | 17 → 19 | 400 | Sentence | 0 | 1.6 |
| --t-note | Courier Prime | 16 → 18 | 400 / 700 | Sentence | 0 | 1.6 |
| --t-scribble | Caveat | 22 → 28 | 500 / 700 | As written | 0 | 1.2 |
| --t-small | Archivo | 14 → 15 | 500 | Sentence | 0.01em | 1.5 |
| --t-code | Share Tech Mono | 14 → 16 | 400 | As typed | 0 | 1.5 |

VT323 renders small for its point size, so it runs about 1.4× the size of the text beside it. Keep body lines at 60–75 characters (max-width: 68ch).

## Treatments and color pairings

Mustard on red is the signature, and it passes contrast for big type only (about 3.8:1), so it belongs to Marquee, Action and Steel — never to paragraphs.

| Swatch | Hex | Use |
| --- | --- | --- |
| Technicolor Red | #B3121B | Poster backgrounds, hero bands |
| Mustard | #F2B705 | Display type on red or navy; highlights |
| Poster Cream | #F4E6C1 | Body text on dark; paper-texture backgrounds |
| Channel Navy | #0d1236 | The site's existing theme color; default page background |
| Ink | #141014 | Drop shadows, outlines, body text on cream |
| Cyborg Red | #FF3B3B | Chakra Petch labels (ON AIR, NOW SHOWING), with a soft glow |
| Phosphor Green | #5CFF8A | VT323 screen text only, echoing CRT glow |
| Index Card | #FBF3DC, lines #b9cbe0 | Notes in Courier Prime |
| Legal Pad | #F7E9A6, lines #c9b766 | Scribbles in Caveat |

| Pairing | Text on background | Allowed for |
| --- | --- | --- |
| Poster | Mustard on Red | Marquee, H1, H2, steel badges |
| Night broadcast | Cream on Navy | Everything, including body (about 14:1) |
| Paperback | Ink on Index Card or Cream | Notes, long reads, blog posts |
| Cyborg vision | Cyborg Red on Navy or Ink | Chakra Petch labels |
| HUD | Phosphor Green on Navy or Ink | VT323 screen text, tickers |

Three signature effects, used on display type only:

1. **Misprint shadow:** a hard offset shadow in Ink, 4–8px down-right, no blur — the poster-ink look.
2. **Extruded block:** stacked shadows (1px, 2px … 6px) in a darker red for a 3D title-card feel.
3. **Chrome/heat glow:** a mustard-to-cream vertical gradient clipped to the text, with a faint red outer glow — save for one hero moment per page.

Signal text gets a 0–2px phosphor glow and can sit under CRT Buddy's scanlines; no other text should.

## Do and don't

| Do | Don't |
| --- | --- |
| One Marquee moment per screen — it's the monster, let it stomp | Stack Marquee, Anton and Steel in the same block |
| Set Action headings in all caps with tight leading | Use Anton for sentences longer than about six words |
| Use Steel like a stamped plate: badges, warnings, one or two words | Set paragraphs, buttons or nav in Michroma |
| Keep broadcast labels (ON AIR, NOW SHOWING) in Chakra Petch red | Mix Cyborg Red and Phosphor Green in the same line |
| Keep CRT Buddy's screen text and tickers in VT323 | Put body text under scanlines or glow |
| Put notes and logs on paper in Courier Prime | Turn the whole site into paper — it's a layer, not the page |
| Use Caveat for a few words of scribble | Write full sentences people must read in Caveat |
| Keep main body text in Archivo on navy or cream | Put body text in mustard on red |
| Make your own homage title cards in these fonts | Copy actual film logos or posters — riff on the era, not the trademark |
| Add katakana with Dela Gothic One as decoration next to an English word | Use katakana as the only label for anything people need to read |

## Drop-in CSS

Paste the link into your page head and the CSS into your stylesheet; every class maps to a row in the type scale above.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wdth,wght@75..100,400..800&family=Caveat:wght@500;700&family=Chakra+Petch:wght@500;600;700&family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Dela+Gothic+One&family=Michroma&family=Share+Tech+Mono&family=VT323&display=swap" rel="stylesheet">
```

```css
:root {
  /* fonts */
  --f-marquee:  "Dela Gothic One", "Arial Black", Impact, sans-serif;
  --f-action:   "Anton", Impact, "Arial Narrow", sans-serif;
  --f-steel:    "Michroma", "Arial Black", sans-serif;
  --f-label:    "Chakra Petch", "Arial Narrow", sans-serif;
  --f-signal:   "VT323", "Courier New", monospace;
  --f-body:     "Archivo", system-ui, -apple-system, "Segoe UI", sans-serif;
  --f-note:     "Courier Prime", "Courier New", monospace;
  --f-scribble: "Caveat", "Brush Script MT", cursive;
  --f-code:     "Share Tech Mono", ui-monospace, Menlo, monospace;

  /* colors */
  --red: #B3121B;  --mustard: #F2B705;  --cream: #F4E6C1;
  --navy: #0d1236; --ink: #141014;      --phosphor: #5CFF8A;
  --cyborg: #FF3B3B; --card: #FBF3DC;   --rule: #b9cbe0;
}

body {
  font-family: var(--f-body);
  font-size: clamp(17px, 1rem + 0.2vw, 19px);
  line-height: 1.6;
  color: var(--cream);
  background: var(--navy);
}
p { max-width: 68ch; }

.t-marquee {
  font-family: var(--f-marquee);
  font-size: clamp(56px, 10vw, 144px);
  line-height: 0.9; letter-spacing: -0.02em; text-transform: uppercase;
  color: var(--mustard);
  text-shadow: 6px 6px 0 var(--ink); /* misprint shadow */
}
h1, .t-h1 {
  font-family: var(--f-action);
  font-size: clamp(44px, 6vw, 88px);
  line-height: 0.95; letter-spacing: 0.01em; text-transform: uppercase;
}
h2, .t-h2 {
  font-family: var(--f-action);
  font-size: clamp(32px, 4vw, 56px);
  line-height: 1; letter-spacing: 0.02em; text-transform: uppercase;
}
h3, .t-h3 {
  font-family: var(--f-body);
  font-stretch: 75%; font-weight: 800;
  font-size: clamp(22px, 2vw, 28px); line-height: 1.15;
}
.t-steel {
  font-family: var(--f-steel);
  font-size: clamp(14px, 1.4vw, 22px);
  letter-spacing: 0.15em; text-transform: uppercase;
}
.t-label {
  font-family: var(--f-label); font-weight: 600;
  font-size: clamp(16px, 1.6vw, 28px);
  letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--cyborg);
  text-shadow: 0 0 8px var(--cyborg);
}
.t-signal {
  font-family: var(--f-signal);
  font-size: clamp(20px, 1.8vw, 28px);
  letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--phosphor);
  text-shadow: 0 0 2px var(--phosphor);
}
code, pre { font-family: var(--f-code); font-size: 15px; }

/* paper layer */
.note {
  font-family: var(--f-note); color: var(--ink);
  line-height: 1.6;
  background: repeating-linear-gradient(180deg, var(--card) 0 calc(1.6em - 2px), var(--rule) calc(1.6em - 2px) 1.6em);
  border-top: 6px solid var(--red);
  padding: 1.6em 1.5em;
  box-shadow: 8px 8px 0 var(--ink);
}
.scribble { font-family: var(--f-scribble); font-weight: 700; color: var(--red); }

/* effects */
.fx-extrude {
  text-shadow: 1px 1px 0 #7a0c12, 2px 2px 0 #7a0c12, 3px 3px 0 #7a0c12,
               4px 4px 0 #7a0c12, 5px 5px 0 #7a0c12, 6px 6px 0 var(--ink);
}
.fx-chrome {
  background: linear-gradient(180deg, var(--cream) 0%, var(--mustard) 55%, #c98a00 100%);
  -webkit-background-clip: text; background-clip: text;
  color: transparent;
  filter: drop-shadow(0 0 12px rgba(179, 18, 27, 0.6));
}
.poster { background: var(--red); color: var(--mustard); }
```

Usage: `<h1 class="t-marquee fx-extrude">taniacryptid</h1>` inside a `.poster` band gives the full mustard-on-red kaiju title.
