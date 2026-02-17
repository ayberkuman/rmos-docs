import { AuthView } from "@neondatabase/auth/react";
import { SignUpWithVerification } from "@/components/auth/sign-up-with-verification";

export const dynamicParams = false;

export default async function AuthPage({
	params,
}: {
	params: Promise<{ path: string }>;
}) {
	const { path } = await params;

	return (
		<main className="container h-screen mx-auto flex grow flex-col items-center justify-center gap-3 self-center p-4 md:p-6">
			{path === "sign-up" ? (
				<SignUpWithVerification />
			) : (
				<AuthView path={path} />
			)}
		</main>
	);
}
