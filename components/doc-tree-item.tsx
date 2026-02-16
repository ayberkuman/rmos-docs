"use client";

import { ChevronRightIcon, FileIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
} from "@/components/ui/sidebar";
import type { TreeNode } from "@/lib/utils/tree";

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
	const hasChildren = node.children.length > 0;
	const isActive = pathname === `/dashboard/${node.slug}`;
	const isFocused = focusedDocId === node.id;

	const [isOpen, setIsOpen] = useState(level === 0);

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation(); // Prevent click-outside handler on parent
		onFocus(node.id);
		router.push(`/dashboard/${node.slug}`);
	};

	if (!hasChildren) {
		return (
			<SidebarMenuItem>
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
				<CollapsibleTrigger asChild>
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
				</CollapsibleTrigger>
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
