import { like } from "drizzle-orm";
import { db } from "@/db";
import { documents } from "@/db/schema";

/**
 * Converts a title string into a URL-safe slug.
 *  "Rezervasyon İşlemleri"  → "rezervasyon-islemleri"
 *  "  Hello   World!!  "   → "hello-world"
 */
function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD") // decompose accented chars
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/ı/g, "i") // Turkish ı → i
    .replace(/İ/g, "i") // Turkish İ → i
    .replace(/ş/g, "s") // Turkish ş → s
    .replace(/Ş/g, "s") // Turkish Ş → s
    .replace(/ç/g, "c") // Turkish ç → c
    .replace(/Ç/g, "c") // Turkish Ç → c
    .replace(/ğ/g, "g") // Turkish ğ → g
    .replace(/Ğ/g, "g") // Turkish Ğ → g
    .replace(/ü/g, "u") // Turkish ü → u
    .replace(/Ü/g, "u") // Turkish Ü → u
    .replace(/ö/g, "o") // Turkish ö → o
    .replace(/Ö/g, "o") // Turkish Ö → o
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanumeric
    .replace(/[\s_]+/g, "-") // spaces/underscores → hyphens
    .replace(/-+/g, "-") // collapse multiple hyphens
    .replace(/^-|-$/g, ""); // trim leading/trailing hyphens
}

/**
 * Generates a unique slug for a document.
 * If "hello-world" already exists, returns "hello-world-1", "hello-world-2", etc.
 */
export async function generateUniqueSlug(title: string): Promise<string> {
  const base = slugify(title) || "untitled";

  // Find all slugs that start with the base slug
  const existing = await db
    .select({ slug: documents.slug })
    .from(documents)
    .where(like(documents.slug, `${base}%`));

  const existingSlugs = new Set(existing.map((r) => r.slug));

  // If the base slug is available, use it
  if (!existingSlugs.has(base)) return base;

  // Otherwise, find the next available suffix
  let counter = 1;
  while (existingSlugs.has(`${base}-${counter}`)) {
    counter++;
  }

  return `${base}-${counter}`;
}
