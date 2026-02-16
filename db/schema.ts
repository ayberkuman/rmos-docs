import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull().default("Untitled"),
    slug: text("slug").notNull().unique(),
    content: jsonb("content"),
    icon: text("icon"),

    // Tree
    parentId: uuid("parent_id").references((): any => documents.id, {
      onDelete: "cascade",
    }),
    position: integer("position").notNull().default(0),

    // Soft delete
    isArchived: boolean("is_archived").notNull().default(false),

    // Timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_documents_parent_id").on(table.parentId),
    index("idx_documents_parent_position").on(table.parentId, table.position),
    index("idx_documents_slug").on(table.slug),
  ],
);

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;
