CREATE TABLE "mentor_chunks" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "mentor_chunks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"kind" text NOT NULL,
	"doc_key" text NOT NULL,
	"title" text NOT NULL,
	"heading" text,
	"ord" integer NOT NULL,
	"body" text NOT NULL,
	"content_hash" text NOT NULL,
	"embedding" vector(1024) NOT NULL,
	"indexed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mentor_chunks_kind_check" CHECK ("mentor_chunks"."kind" in ('lesson', 'source')),
	CONSTRAINT "mentor_chunks_ord_check" CHECK ("mentor_chunks"."ord" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "mentor_chunks_doc_hash_idx" ON "mentor_chunks" USING btree ("doc_key","content_hash");--> statement-breakpoint
CREATE INDEX "mentor_chunks_embedding_idx" ON "mentor_chunks" USING hnsw ("embedding" vector_cosine_ops);