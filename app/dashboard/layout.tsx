import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { getAllDocumentsMeta } from "@/lib/data/documents";
import { getQueryClient } from "@/lib/react-query/get-query-client";

export default async function DashboardLayout({
	children,
}: {
	children: ReactNode;
}) {
	const queryClient = getQueryClient();

	// Prefetch document metadata on the server so it's available immediately on the client, avoiding a loading state.
	await queryClient.prefetchQuery({
		queryKey: ["documents"],
		queryFn: getAllDocumentsMeta,
	});

	return (
		<SidebarProvider>
			<HydrationBoundary state={dehydrate(queryClient)}>
				<AppSidebar />
				<SidebarInset>
					<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
						<div className="flex items-center gap-2 px-4">
							<SidebarTrigger className="-ml-1" />
							<Separator
								orientation="vertical"
								className="mr-2 data-vertical:h-4 data-vertical:self-auto"
							/>
						</div>
					</header>
					{children}
				</SidebarInset>
			</HydrationBoundary>
		</SidebarProvider>
	);
}
