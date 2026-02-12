"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Page() {
	const router = useRouter();
	return (
		<>
			<div>landing</div>
			<Button
				onClick={() => {
					router.push("/auth/asjdkasygd");
				}}
			>
				Auth
			</Button>
		</>
	);
}
