"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";

type Step = "auth" | "verify";

export function SignUpWithVerification() {
	const router = useRouter();
	const [step, setStep] = useState<Step>("auth");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [code, setCode] = useState("");
	const [message, setMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [resendDisabled, setResendDisabled] = useState(false);

	const handleSignUp = async (e: React.FormEvent) => {
		e.preventDefault();
		setMessage("");
		setIsLoading(true);

		try {
			const { data, error } = await authClient.signUp.email({
				email,
				password,
				name,
			});

			if (error) throw error;

			if (data?.user && !data.user.emailVerified) {
				setMessage("Check your email for a verification code");
				setStep("verify");
			} else if (data?.token) {
				router.push("/account/settings");
			}
		} catch (error: unknown) {
			const err = error as { message?: string };
			setMessage(err?.message || "An error occurred during sign up");
		} finally {
			setIsLoading(false);
		}
	};

	const handleVerify = async (e: React.FormEvent) => {
		e.preventDefault();
		setMessage("");
		setIsLoading(true);

		try {
			const { data, error } = await authClient.emailOtp.verifyEmail({
				email,
				otp: code,
			});

			if (error) throw error;

			if (data?.token) {
				router.push("/account/settings");
			} else {
				setMessage("Email verified! You can now sign in.");
				setStep("auth");
				setCode("");
			}
		} catch (error: unknown) {
			const err = error as { message?: string };
			setMessage(err?.message || "Invalid verification code");
		} finally {
			setIsLoading(false);
		}
	};

	const handleResend = async () => {
		setResendDisabled(true);
		setMessage("");

		try {
			const { error } = await authClient.sendVerificationEmail({
				email,
				callbackURL: window.location.origin + "/",
			});

			if (error) throw error;
			setMessage("Verification email sent! Check your inbox.");
		} catch (error: unknown) {
			const err = error as { message?: string };
			setMessage(err?.message || "Failed to resend verification email");
			setResendDisabled(false);
		}

		setTimeout(() => setResendDisabled(false), 30000);
	};

	if (step === "verify") {
		return (
			<div
				data-slot="card"
				className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm w-full max-w-sm"
			>
				<div
					data-slot="card-header"
					className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6"
				>
					<div
						data-slot="card-title"
						className="font-semibold text-lg md:text-xl"
					>
						Verify Your Email
					</div>
					<div
						data-slot="card-description"
						className="text-muted-foreground text-xs md:text-sm"
					>
						Enter the code sent to{" "}
						<span className="font-medium text-foreground">{email}</span>
					</div>
				</div>

				<div data-slot="card-content" className="px-6 grid gap-6">
					<div className="grid gap-4">
						<form className="grid w-full gap-2" onSubmit={handleVerify}>
							<div data-slot="form-item" className="grid gap-2">
								<label
									htmlFor="code"
									data-slot="form-label"
									className="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
								>
									Verification Code
								</label>
								<input
									id="code"
									type="text"
									inputMode="numeric"
									data-slot="form-control"
									className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
									placeholder="Enter verification code"
									value={code}
									onChange={(e) => setCode(e.target.value)}
									required
								/>
							</div>

							{message && (
								<p
									className={`text-xs ${
										message.includes("sent") || message.includes("verified")
											? "text-green-500"
											: "text-orange-500"
									}`}
								>
									{message}
								</p>
							)}

							<button
								data-slot="button"
								type="submit"
								disabled={isLoading}
								className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 w-full cursor-pointer"
							>
								{isLoading ? "Verifying..." : "Verify"}
							</button>
						</form>
					</div>
				</div>

				<div
					data-slot="card-footer"
					className="flex flex-col items-center px-6 justify-center gap-1.5 text-muted-foreground text-sm"
				>
					<div className="flex items-center gap-1.5">
						<span>Didn&apos;t receive the code?</span>
						<button
							type="button"
							onClick={handleResend}
							disabled={resendDisabled}
							data-slot="button"
							className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 underline-offset-4 hover:underline h-8 gap-1.5 px-0 text-foreground underline cursor-pointer"
						>
							Resend
						</button>
					</div>
					<button
						type="button"
						onClick={() => {
							setStep("auth");
							setCode("");
							setMessage("");
						}}
						data-slot="button"
						className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all underline-offset-4 hover:underline h-8 gap-1.5 px-0 text-muted-foreground cursor-pointer"
					>
						← Back to sign up
					</button>
				</div>
			</div>
		);
	}

	return (
		<div
			data-slot="card"
			className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm w-full max-w-sm"
		>
			<div
				data-slot="card-header"
				className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6"
			>
				<div
					data-slot="card-title"
					className="font-semibold text-lg md:text-xl"
				>
					Sign Up
				</div>
				<div
					data-slot="card-description"
					className="text-muted-foreground text-xs md:text-sm"
				>
					Enter your details below to create your account
				</div>
			</div>

			<div data-slot="card-content" className="px-6 grid gap-6">
				<div className="grid gap-4">
					<form className="grid w-full gap-6" onSubmit={handleSignUp}>
						<div data-slot="form-item" className="grid gap-2">
							<label
								htmlFor="name"
								data-slot="form-label"
								className="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
							>
								Name
							</label>
							<input
								id="name"
								type="text"
								data-slot="form-control"
								className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
								placeholder="Your name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
							/>
						</div>

						<div data-slot="form-item" className="grid gap-2">
							<label
								htmlFor="email"
								data-slot="form-label"
								className="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
							>
								Email
							</label>
							<input
								id="email"
								type="email"
								data-slot="form-control"
								className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
								placeholder="m@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>

						<div data-slot="form-item" className="grid gap-2">
							<label
								htmlFor="password"
								data-slot="form-label"
								className="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
							>
								Password
							</label>
							<input
								id="password"
								type="password"
								data-slot="form-control"
								className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
								placeholder="Password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								minLength={8}
							/>
						</div>

						{message && (
							<p className="text-xs md:text-sm text-destructive">{message}</p>
						)}

						<button
							data-slot="button"
							type="submit"
							disabled={isLoading}
							className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 w-full cursor-pointer"
						>
							{isLoading ? "Creating account..." : "Sign Up"}
						</button>
					</form>
				</div>
			</div>

			<div
				data-slot="card-footer"
				className="flex items-center px-6 justify-center gap-1.5 text-muted-foreground text-sm"
			>
				Don&apos;t have an account?
				<a href="/auth/sign-in">
					<button
						data-slot="button"
						type="button"
						className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all underline-offset-4 hover:underline h-8 gap-1.5 px-0 text-foreground underline cursor-pointer"
					>
						Sign In
					</button>
				</a>
			</div>
		</div>
	);
}
