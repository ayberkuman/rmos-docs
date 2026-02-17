"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileTextIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { createDocumentAction } from "@/app/actions/documents";
import {
	SidebarGroup,
	SidebarGroupAction,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
} from "@/components/ui/sidebar";
import { buildTree, type DocumentMeta } from "@/lib/utils/tree";
import { DocTreeItem } from "./doc-tree-item";

async function fetchDocumentsMeta(): Promise<DocumentMeta[]> {
	const res = await fetch("/api/documents");
	if (!res.ok) throw new Error("Failed to fetch documents");
	return res.json();
}

interface DocTreeProps {
	focusedDocId: string | null;
	onFocusDoc: (docId: string) => void;
}

export function DocTree({ focusedDocId, onFocusDoc }: DocTreeProps) {
	const router = useRouter();
	const queryClient = useQueryClient();

	const { data: docs = [] } = useQuery<DocumentMeta[]>({
		queryKey: ["documents"],
		queryFn: fetchDocumentsMeta, //TODO: bunun çekildiği yeri server componente çevirebilir miyiz?
	});

	const { mutate: handleCreate, isPending } = useMutation({
		mutationFn: createDocumentAction,
		onSuccess: (newDoc) => {
			queryClient.invalidateQueries({ queryKey: ["documents"] });
			router.push(`/dashboard/${newDoc.slug}`);
		},
	});

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
