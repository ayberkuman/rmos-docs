"use client";

import { FileTextIcon, PlusIcon } from "lucide-react";
import {
	SidebarGroup,
	SidebarGroupAction,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
} from "@/components/ui/sidebar";
import { buildTree } from "../../documents/helpers";
import { useDocuments } from "../../documents/hooks/use-documents";
import { DocTreeItem } from "./doc-tree-item";

interface DocTreeProps {
	focusedDocId: string | null;
	onFocusDoc: (docId: string) => void;
}

export function DocTree({ focusedDocId, onFocusDoc }: DocTreeProps) {
	const {
		documents: docs,
		createDocument: handleCreate,
		isCreating: isPending,
	} = useDocuments();

	const tree = buildTree(docs);

	return (
		<SidebarGroup onClick={(e) => e.stopPropagation()}>
			<SidebarGroupLabel>Documents</SidebarGroupLabel>
			<SidebarGroupAction
				title={focusedDocId ? "New child document" : "New document"}
				disabled={isPending}
				onClick={() =>
					handleCreate(focusedDocId ? { parentId: focusedDocId } : {})
				}
			>
				<PlusIcon />
				<span className="sr-only">New document</span>
			</SidebarGroupAction>
			<SidebarGroupContent>
				<SidebarMenu>
					{tree.length === 0 ? (
						<li className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-sm text-muted-foreground">
							<FileTextIcon className="size-8 opacity-40" />
							<span>No documents yet</span>
						</li>
					) : (
						tree.map((node) => (
							<DocTreeItem
								key={node.id}
								node={node}
								level={0}
								focusedDocId={focusedDocId}
								onFocus={onFocusDoc}
							/>
						))
					)}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
