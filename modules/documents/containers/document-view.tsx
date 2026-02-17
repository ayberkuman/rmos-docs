import { notFound } from "next/navigation";
import { getDocumentBySlug } from "@/lib/data/documents";

export async function DocumentView({ slug }: { slug: string }) {
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
