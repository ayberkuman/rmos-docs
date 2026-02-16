import { FileTextIcon } from "lucide-react";

export default function DashboardPage() {
	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
			<div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
				<FileTextIcon className="size-8 text-muted-foreground" />
			</div>
			<div className="space-y-1.5">
				<h2 className="text-xl font-semibold">Select a document</h2>
				<p className="text-sm text-muted-foreground">
					Choose a document from the sidebar to start editing, or create a new
					one.
				</p>
			</div>
		</div>
	);
}
