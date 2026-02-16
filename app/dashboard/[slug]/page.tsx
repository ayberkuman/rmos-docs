import { notFound } from "next/navigation";
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
		<div className="flex-1 p-6">
			<div className="mx-auto max-w-3xl">
				<h1 className="mb-4 text-3xl font-bold">
					{doc.icon && <span className="mr-2">{doc.icon}</span>}
					{doc.title}
				</h1>
				{doc.content ? (
					<pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">
						{JSON.stringify(doc.content, null, 2)}
					</pre>
				) : (
					<p className="text-muted-foreground">
						This document is empty. Start writing...
					</p>
				)}
			</div>
		</div>
	);
}
