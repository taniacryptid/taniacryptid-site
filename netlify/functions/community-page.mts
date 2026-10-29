import type { Config } from "@netlify/functions";
import { getCommunity, renderCommunity } from "../lib/community.js";
import { pageHeaders } from "../lib/pages.js";

// Cached at the CDN until the Community page is edited; the pages API purges the "community" tag on save
export default async () => new Response(renderCommunity(await getCommunity()), { headers: pageHeaders("community") });

export const config: Config = {
  path: ["/community", "/community/"],
};
