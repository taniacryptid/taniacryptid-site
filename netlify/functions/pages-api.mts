import { purgeCache, type Config } from "@netlify/functions";
import { cleanAbout, defaultAbout, getAbout, saveAbout } from "../lib/about.js";
import { requireAdmin } from "../lib/auth.js";

// Admin editor for the About page: GET loads the current content, PUT saves it.
// POST /api/pages/about/reset puts back the original content.
export default async (req: Request) => {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const reset = new URL(req.url).pathname.endsWith("/reset");

  if (req.method === "GET" && !reset) return Response.json(await getAbout());

  if ((req.method === "PUT" && !reset) || (req.method === "POST" && reset)) {
    const about = reset ? defaultAbout : cleanAbout(await req.json().catch(() => ({})));
    const saved = await saveAbout(about);
    try {
      await purgeCache({ tags: ["about"] });
    } catch (err) {
      console.error("Cache purge failed", err);
    }
    return Response.json(saved);
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: ["/api/pages/about", "/api/pages/about/reset"],
};
