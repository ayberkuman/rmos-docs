import { notFound } from "next/navigation";
import { SimpleEditor } from "@/components/tiptap/simple/simple-editor";
import { getDocumentBySlug } from "@/lib/queries/documents";

export const dynamic = "force-dynamic";

export default async function DocumentPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const doc = await getDocumentBySlug(slug);

	if (!doc) notFound();

	return (
		<div className="flex-1">
			<SimpleEditor content={doc.content} />
		</div>
	);
}
