"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { forwardRef } from "react";
import { cn } from "@/lib/tiptap-utils";
import "@/components/tiptap/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss";

function DropdownMenu({
	children,
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
	return <PopoverPrimitive.Root {...props}>{children}</PopoverPrimitive.Root>;
}

const DropdownMenuTrigger = forwardRef<
	React.ComponentRef<typeof PopoverPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>
>(({ ...props }, ref) => <PopoverPrimitive.Trigger ref={ref} {...props} />);
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

const DropdownMenuContent = forwardRef<
	React.ComponentRef<typeof PopoverPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
		portal?: boolean;
	}
>(({ className, sideOffset = 4, portal = false, ...props }, ref) => {
	const content = (
		<PopoverPrimitive.Content
			ref={ref}
			sideOffset={sideOffset}
			onOpenAutoFocus={(e) => e.preventDefault()}
			onCloseAutoFocus={(e) => e.preventDefault()}
			className={cn("tiptap-dropdown-menu", className)}
			{...props}
		/>
	);

	return portal ? (
		<PopoverPrimitive.Portal>{content}</PopoverPrimitive.Portal>
	) : (
		content
	);
});
DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuItem = forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => <div ref={ref} role="menuitem" {...props} />);
DropdownMenuItem.displayName = "DropdownMenuItem";

export {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
};
