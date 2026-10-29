import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { randomUUID } from "node:crypto";
import { requireAdmin } from "../lib/auth.js";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};
const MAX_SIZE = 8 * 1024 * 1024;

const store = () => getStore({ name: "blog-images", consistency: "strong" });

export default async (req: Request, context: Context) => {
  // Public: serve an uploaded image
  if (req.method === "GET" && context.params.key) {
    const result = await store().getWithMetadata(context.params.key, { type: "stream" });
    if (!result) return new Response("Not found", { status: 404 });
    return new Response(result.data, {
      headers: {
        "Content-Type": String(result.metadata?.contentType || "image/jpeg"),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  // Admin: upload a new image
  if (req.method === "POST" && !context.params.key) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;
    const image = (await req.formData()).get("image");
    if (!(image instanceof File)) return Response.json({ error: "No image provided" }, { status: 400 });
    const ext = ALLOWED_TYPES[image.type];
    if (!ext) return Response.json({ error: "Use a JPG, PNG, GIF or WebP image" }, { status: 400 });
    if (image.size > MAX_SIZE) return Response.json({ error: "Images must be under 8 MB" }, { status: 400 });

    const key = `${randomUUID()}.${ext}`;
    await store().set(key, await image.arrayBuffer(), {
      metadata: { contentType: image.type, originalFilename: image.name, uploadedAt: new Date().toISOString() },
    });
    return Response.json({ key, url: `/uploads/${key}` }, { status: 201 });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: ["/api/uploads", "/uploads/:key"],
};
