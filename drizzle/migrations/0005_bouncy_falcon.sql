CREATE TABLE "cursor_rule" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"content" text NOT NULL,
	"rule_type" text NOT NULL,
	"globs" text,
	"category_id" text,
	"author_id" text NOT NULL,
	"upvotes" integer DEFAULT 0,
	"views" integer DEFAULT 0,
	"copy_count" integer DEFAULT 0,
	"featured" boolean DEFAULT false,
	"published" boolean DEFAULT true,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "cursor_rule_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "cursor_rule_upvote" (
	"id" text PRIMARY KEY NOT NULL,
	"cursor_rule_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cursor_rule" ADD CONSTRAINT "cursor_rule_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cursor_rule" ADD CONSTRAINT "cursor_rule_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cursor_rule_upvote" ADD CONSTRAINT "cursor_rule_upvote_cursor_rule_id_cursor_rule_id_fk" FOREIGN KEY ("cursor_rule_id") REFERENCES "public"."cursor_rule"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cursor_rule_upvote" ADD CONSTRAINT "cursor_rule_upvote_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;