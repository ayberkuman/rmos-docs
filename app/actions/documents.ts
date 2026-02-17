"use server";

import { eq } from "drizzle-orm";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { generateUniqueSlug } from "@/lib/utils/slug";

export async function createDocumentAction(data: {
  title?: string;
  parentId?: string;
  icon?: string;
}) {
  try {
    const { title = "Untitled", icon, parentId } = data;
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
    return doc;
  } catch (error) {
    console.error("Failed to create document:", error);
    throw new Error("Failed to create document");
  }
}

export async function updateDocumentAction(
  id: string,
  data: {
    title?: string;
    content?: unknown;
    icon?: string;
    parentId?: string;
    position?: number;
  },
) {
  try {
    const { title, content, icon, parentId, position } = data;

    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (icon !== undefined) updates.icon = icon;
    if (parentId !== undefined) updates.parentId = parentId;
    if (position !== undefined) updates.position = position;

    const [doc] = await db
      .update(documents)
      .set(updates)
      .where(eq(documents.id, id))
      .returning();

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/${doc.slug}`);
    return doc;
  } catch (error) {
    console.error("Failed to update document:", error);
    throw new Error("Failed to update document");
  }
}

export async function deleteDocumentAction(id: string) {
  try {
    // Soft delete — set isArchived to true
    await db
      .update(documents)
      .set({ isArchived: true })
      .where(eq(documents.id, id));

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete document:", error);
    throw new Error("Failed to delete document");
  }
}
