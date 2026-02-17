import { NextResponse } from "next/server";
import { getAllDocumentsMeta } from "@/lib/data/documents";

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
