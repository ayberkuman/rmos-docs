"use client";

import { ArchiveIcon, ChevronRightIcon, FileIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
} from "@/components/ui/sidebar";
import { useDocuments } from "../../documents/hooks/use-documents";
import type { TreeNode } from "../../documents/types";

interface DocTreeItemProps {
	node: TreeNode;
	level: number;
	focusedDocId: string | null;
	onFocus: (docId: string) => void;
}

export function DocTreeItem({
	node,
	level,
	focusedDocId,
	onFocus,
}: DocTreeItemProps) {
	const router = useRouter();
	const pathname = usePathname();
	const { archiveDocument } = useDocuments();
	const hasChildren = node.children.length > 0;
	const isActive = pathname === `/dashboard/${node.slug}`;
	const isFocused = focusedDocId === node.id;

	const [isOpen, setIsOpen] = useState(level === 0);

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation(); // Prevent click-outside handler on parent
		onFocus(node.id);
		router.push(`/dashboard/${node.slug}`);
	};

	const handleArchive = (e: React.MouseEvent) => {
		e.stopPropagation();
		archiveDocument(node.id);
	};

	if (!hasChildren) {
		return (
			<SidebarMenuItem>
				<ContextMenu>
					<ContextMenuTrigger asChild>
						<SidebarMenuButton
							isActive={isActive}
							onClick={handleClick}
							className={`gap-2 ${isFocused ? "ring-1 ring-sidebar-ring" : ""}`}
							data-focused={isFocused || undefined}
						>
							<span className="shrink-0 text-base leading-none">
								{node.icon || <FileIcon className="size-4" />}
							</span>
							<span className="truncate">{node.title}</span>
						</SidebarMenuButton>
					</ContextMenuTrigger>
					<ContextMenuContent>
						<ContextMenuItem onClick={handleArchive}>
							<ArchiveIcon className="mr-2 size-4" />
							Archive
						</ContextMenuItem>
					</ContextMenuContent>
				</ContextMenu>
			</SidebarMenuItem>
		);
	}

	return (
		<Collapsible
			asChild
			open={isOpen}
			onOpenChange={setIsOpen}
			className="group/collapsible"
		>
			<SidebarMenuItem>
				<ContextMenu>
					<CollapsibleTrigger asChild>
						<ContextMenuTrigger asChild>
							<SidebarMenuButton
								isActive={isActive}
								onClick={handleClick}
								className={`gap-2 ${isFocused ? "ring-1 ring-sidebar-ring" : ""}`}
								data-focused={isFocused || undefined}
							>
								<span className="shrink-0 text-base leading-none">
									{node.icon || <FileIcon className="size-4" />}
								</span>
								<span className="truncate flex-1">{node.title}</span>
								<ChevronRightIcon
									className="ml-auto size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
									onClick={(e) => {
										e.stopPropagation();
										setIsOpen(!isOpen);
									}}
								/>
							</SidebarMenuButton>
						</ContextMenuTrigger>
					</CollapsibleTrigger>
					<ContextMenuContent>
						<ContextMenuItem onClick={handleArchive}>
							<ArchiveIcon className="mr-2 size-4" />
							Archive
						</ContextMenuItem>
					</ContextMenuContent>
				</ContextMenu>
				<CollapsibleContent>
					<SidebarMenuSub>
						{node.children.map((child) => (
							<DocTreeItem
								key={child.id}
								node={child}
								level={level + 1}
								focusedDocId={focusedDocId}
								onFocus={onFocus}
							/>
						))}
					</SidebarMenuSub>
				</CollapsibleContent>
			</SidebarMenuItem>
		</Collapsible>
	);
}
