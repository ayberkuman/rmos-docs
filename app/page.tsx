import { ArrowRightIcon, BookOpenIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
	const { data: session } = await auth.getSession();
	const isAuthenticated = !!session;

	return (
		<main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-16">
			<div className="flex flex-col items-center gap-4 text-center">
				<div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
					<BookOpenIcon className="size-8" />
				</div>
				<h1 className="text-4xl font-bold tracking-tight">RMOS Docs</h1>
				<p className="max-w-md text-lg text-muted-foreground">
					Front Office ve Back Office için merkezi dokümantasyon platformu.
				</p>
			</div>

			<Button asChild size="lg" className="gap-2">
				{isAuthenticated ? (
					<Link href="/dashboard">
						Dashboard'a Git
						<ArrowRightIcon className="size-4" />
					</Link>
				) : (
					<Link href="/auth/sign-in">
						Giriş Yap
						<ArrowRightIcon className="size-4" />
					</Link>
				)}
			</Button>
		</main>
	);
}
