"use client";

import { UserButton } from "@neondatabase/auth/react";
import { BookOpenIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { DocTree } from "@/components/doc-tree";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const [focusedDocId, setFocusedDocId] = useState<string | null>(null);

	const handleFocusDoc = useCallback((docId: string) => {
		setFocusedDocId(docId);
	}, []);

	const handleClearFocus = useCallback(() => {
		setFocusedDocId(null);
	}, []);

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<div className="flex items-center gap-2 px-2 py-1.5">
					<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
						<BookOpenIcon className="size-4" />
					</div>
					<div className="grid flex-1 text-left text-sm leading-tight">
						<span className="truncate font-semibold">RMOS Docs</span>
						<span className="truncate text-xs text-muted-foreground">
							Documentation
						</span>
					</div>
				</div>
			</SidebarHeader>
			<SidebarContent onClick={handleClearFocus}>
				<DocTree focusedDocId={focusedDocId} onFocusDoc={handleFocusDoc} />
			</SidebarContent>
			<SidebarFooter>
				<div className="flex items-center justify-end py-2">
					<UserButton size="icon" align="end" />
				</div>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
