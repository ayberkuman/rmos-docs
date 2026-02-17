import { DocumentView } from "@/modules/documents/containers/document-view";

export const dynamic = "force-dynamic";

export default async function DocumentPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;

	return <DocumentView slug={slug} />;
}
