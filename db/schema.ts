import { jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const posts = pgTable("posts", {
  id: serial().primaryKey(),
  slug: text().notNull().unique(),
  title: text().notNull(),
  excerpt: text().notNull().default(""),
  body: text().notNull().default(""),
  coverImage: text("cover_image"),
  categories: text().array().notNull().default([]),
  status: text().notNull().default("draft"), // "draft" | "published"
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Post = typeof posts.$inferSelect;

// Editable site pages (e.g. "about"). Content is a JSON document whose shape depends on the page.
export const pages = pgTable("pages", {
  slug: text().primaryKey(),
  content: jsonb().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Page = typeof pages.$inferSelect;
