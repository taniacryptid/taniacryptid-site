CREATE TABLE "pages" (
	"slug" text PRIMARY KEY,
	"content" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
