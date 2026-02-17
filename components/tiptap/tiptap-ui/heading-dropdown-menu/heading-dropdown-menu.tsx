"use client";

import { forwardRef, useCallback, useState } from "react";

// --- Icons ---
import { ChevronDownIcon } from "@/components/tiptap/tiptap-icons/chevron-down-icon";
// --- Tiptap UI ---
import { HeadingButton } from "@/components/tiptap/tiptap-ui/heading-button";
import type { UseHeadingDropdownMenuConfig } from "@/components/tiptap/tiptap-ui/heading-dropdown-menu";
import { useHeadingDropdownMenu } from "@/components/tiptap/tiptap-ui/heading-dropdown-menu";
// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap/tiptap-ui-primitive/button";
import {
	Button,
	ButtonGroup,
} from "@/components/tiptap/tiptap-ui-primitive/button";
import { Card, CardBody } from "@/components/tiptap/tiptap-ui-primitive/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/tiptap/tiptap-ui-primitive/dropdown-menu";
// --- Hooks ---
import { useTiptapEditor } from "@/hooks/tiptap/use-tiptap-editor";

export interface HeadingDropdownMenuProps
	extends Omit<ButtonProps, "type">,
		UseHeadingDropdownMenuConfig {
	/**
	 * Whether to render the dropdown menu in a portal
	 * @default false
	 */
	portal?: boolean;
	/**
	 * Callback for when the dropdown opens or closes
	 */
	onOpenChange?: (isOpen: boolean) => void;
}

/**
 * Dropdown menu component for selecting heading levels in a Tiptap editor.
 *
 * For custom dropdown implementations, use the `useHeadingDropdownMenu` hook instead.
 */
export const HeadingDropdownMenu = forwardRef<
	HTMLButtonElement,
	HeadingDropdownMenuProps
>(
	(
		{
			editor: providedEditor,
			levels = [1, 2, 3, 4, 5, 6],
			hideWhenUnavailable = false,
			portal = false,
			onOpenChange,
			children,
			...buttonProps
		},
		ref,
	) => {
		const { editor } = useTiptapEditor(providedEditor);
		const [isOpen, setIsOpen] = useState<boolean>(false);
		const { isVisible, isActive, canToggle, Icon } = useHeadingDropdownMenu({
			editor,
			levels,
			hideWhenUnavailable,
		});

		const handleOpenChange = useCallback(
			(open: boolean) => {
				setIsOpen(open);
				onOpenChange?.(open);
			},
			[onOpenChange],
		);

		if (!isVisible) {
			return null;
		}

		return (
			<DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
				<DropdownMenuTrigger asChild>
					<Button
						type="button"
						variant="ghost"
						data-active-state={isActive ? "on" : "off"}
						role="button"
						tabIndex={-1}
						disabled={!canToggle}
						data-disabled={!canToggle}
						aria-label="Format text as heading"
						aria-pressed={isActive}
						tooltip="Heading"
						{...buttonProps}
						ref={ref}
					>
						{children ? (
							children
						) : (
							<>
								<Icon className="tiptap-button-icon" />
								<ChevronDownIcon className="tiptap-button-dropdown-small" />
							</>
						)}
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent align="start" portal={portal}>
					<Card>
						<CardBody>
							<ButtonGroup>
								{levels.map((level) => (
									<DropdownMenuItem
										key={`heading-${level}`}
										onClick={() => setIsOpen(false)}
									>
										<HeadingButton
											editor={editor}
											level={level}
											text={`Heading ${level}`}
											showTooltip={false}
										/>
									</DropdownMenuItem>
								))}
							</ButtonGroup>
						</CardBody>
					</Card>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	},
);

HeadingDropdownMenu.displayName = "HeadingDropdownMenu";

export default HeadingDropdownMenu;
