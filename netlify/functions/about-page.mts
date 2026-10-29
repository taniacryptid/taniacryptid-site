import type { Config } from "@netlify/functions";
import { getAbout, renderAbout } from "../lib/about.js";

// Cached at the CDN until the About page is edited; the pages API purges the "about" tag on save
export default async () =>
  new Response(renderAbout(await getAbout()), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Netlify-CDN-Cache-Control": "public, durable, max-age=86400, stale-while-revalidate=60",
      "Netlify-Cache-Tag": "about",
    },
  });

export const config: Config = {
  path: ["/about", "/about/"],
};
