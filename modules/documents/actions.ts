"use server";

import type { Content } from "@tiptap/react";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { generateUniqueSlug } from "@/lib/utils/slug";

export async function createDocument(
  title: string = "Untitled",
  parentId?: string | null,
  icon?: string | null,
) {
  try {
    const slug = await generateUniqueSlug(title);

    const [doc] = await db
      .insert(documents)
      .values({
        title,
        slug,
        icon: icon ?? null,
        parentId: parentId ?? null,
        position: 0,
      })
      .returning();

    revalidatePath("/dashboard");
    return { data: doc };
  } catch (error) {
    console.error("Failed to create document:", error);
    return { error: "Failed to create document" };
  }
}

export async function archiveDocument(documentId: string) {
  try {
    await db
      .update(documents)
      .set({ isArchived: true })
      .where(eq(documents.id, documentId));

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to archive document:", error);
    return { error: "Failed to archive document" };
  }
}

export async function updateDocumentContent(
  documentId: string,
  content: Content,
) {
  try {
    await db
      .update(documents)
      .set({ content })
      .where(eq(documents.id, documentId));

    return { success: true };
  } catch (error) {
    console.error("Failed to update document content:", error);
    return { error: "Failed to update document content" };
  }
}
