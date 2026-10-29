import type { Config } from "@netlify/functions";
import { getAbout, renderAbout } from "../lib/about.js";
import { pageHeaders } from "../lib/pages.js";

// Cached at the CDN until the About page is edited; the pages API purges the "about" tag on save
export default async () => new Response(renderAbout(await getAbout()), { headers: pageHeaders("about") });

export const config: Config = {
  path: ["/about", "/about/"],
};
