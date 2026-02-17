"use server";

import type { Content } from "@tiptap/react";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { generateUniqueSlug } from "@/lib/utils/slug";

export async function createDocument(
  title: string = "Untitled",
  parentId?: string | null,
  icon?: string | null,
) {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.session) {
      return { error: "Unauthorized" };
    }

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

export async function updateDocumentContent(
  documentId: string,
  content: Content,
) {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.session) {
      return { error: "Unauthorized" };
    }

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
