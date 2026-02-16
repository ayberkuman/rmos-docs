import { NextResponse } from "next/server";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { getAllDocumentsMeta } from "@/lib/queries/documents";
import { generateUniqueSlug } from "@/lib/utils/slug";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const docs = await getAllDocumentsMeta();
    return NextResponse.json(docs);
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title = "Untitled", icon, parentId } = body;

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

    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    console.error("Failed to create document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 },
    );
  }
}
