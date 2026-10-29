import { purgeCache, type Config, type Context } from "@netlify/functions";
import { cleanAbout, defaultAbout } from "../lib/about.js";
import { requireAdmin } from "../lib/auth.js";
import { cleanCommunity, defaultCommunity } from "../lib/community.js";
import { cleanLivestreams, defaultLivestreams } from "../lib/livestreams.js";
import { loadPage, storePage } from "../lib/pages.js";

// Each editable page: its original content and how to clean what the editor sends
const editable: Record<string, { defaults: object; clean: (input: any) => object }> = {
  about: { defaults: defaultAbout, clean: cleanAbout },
  community: { defaults: defaultCommunity, clean: cleanCommunity },
  livestreams: { defaults: defaultLivestreams, clean: cleanLivestreams },
};

// Admin editor for the site's pages: GET /api/pages/:slug loads the current content, PUT saves it.
// POST /api/pages/:slug/reset puts back the original content.
export default async (req: Request, context: Context) => {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const slug = context.params.slug;
  const pageDef = Object.hasOwn(editable, slug) ? editable[slug] : null;
  if (!pageDef) return Response.json({ error: "No such page" }, { status: 404 });

  const reset = new URL(req.url).pathname.endsWith("/reset");

  if (req.method === "GET" && !reset) return Response.json(await loadPage(slug, pageDef.defaults));

  if ((req.method === "PUT" && !reset) || (req.method === "POST" && reset)) {
    const content = reset ? pageDef.defaults : pageDef.clean(await req.json().catch(() => ({})));
    const saved = await storePage(slug, content);
    try {
      await purgeCache({ tags: [slug] });
    } catch (err) {
      console.error("Cache purge failed", err);
    }
    return Response.json(saved);
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: ["/api/pages/:slug", "/api/pages/:slug/reset"],
};
