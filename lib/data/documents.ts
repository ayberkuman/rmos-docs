import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { documents } from "@/db/schema";

/**
 * Fetches all non-archived documents WITHOUT content.
 * Used by the sidebar tree — prefetched in dashboard layout.
 */
export async function getAllDocumentsMeta() {
  return db
    .select({
      id: documents.id,
      title: documents.title,
      slug: documents.slug,
      icon: documents.icon,
      parentId: documents.parentId,
      position: documents.position,
      isArchived: documents.isArchived,
    })
    .from(documents)
    .where(eq(documents.isArchived, false))
    .orderBy(asc(documents.position));
}

/**
 * Fetches a single document by slug (includes content).
 */
export async function getDocumentBySlug(slug: string) {
  const results = await db
    .select()
    .from(documents)
    .where(eq(documents.slug, slug))
    .limit(1);

  return results[0] ?? null;
}
