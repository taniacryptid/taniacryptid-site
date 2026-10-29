import type { Config } from "@netlify/functions";
import { getLivestreams, renderLivestreams } from "../lib/livestreams.js";
import { pageHeaders } from "../lib/pages.js";

// Cached at the CDN until the Livestreams page is edited (the pages API purges the "livestreams" tag),
// and for an hour at most so streams move from "Coming up" to "Reruns" on their own
export default async () =>
  new Response(renderLivestreams(await getLivestreams()), { headers: pageHeaders("livestreams", 3600) });

export const config: Config = {
  path: ["/livestreams", "/livestreams/"],
};
