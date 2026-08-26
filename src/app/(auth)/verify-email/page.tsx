"use client";

import { apiVerifyEmail } from "@/api/auth.api";
import { CheckCircle2, CircleAlert, LoaderCircle, MailCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("We’re confirming your email address...");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }

    let isMounted = true;
    let timeoutId: number | undefined;

    const verify = async () => {
      try {
        const response = await apiVerifyEmail(token);

        if (!isMounted) return;

        setStatus("success");
        setMessage(
          response.message || "Your email has been verified successfully."
        );

        timeoutId = window.setTimeout(() => {
          if (isMounted) router.push("/login");
        }, 3000);
      } catch (error: any) {
        if (!isMounted) return;

        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Verification link is invalid or has expired."
        );
      }
    };

    void verify();

    return () => {
      isMounted = false;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [router, searchParams]);

  const isSuccess = status === "success";
  const isError = status === "error";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#faf8f5] dark:bg-[#121212] px-4 py-8 text-slate-800 dark:text-[#f2efe9] sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-orange-500/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-orange-600/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-5xl overflow-hidden rounded-[32px] border border-slate-200/80 dark:border-neutral-800 bg-white/90 dark:bg-[#191919]/90 shadow-[0_30px_90px_-25px_rgba(0,0,0,0.15)] dark:shadow-[0_30px_90px_-25px_rgba(0,0,0,0.7)] backdrop-blur-xl">
        <div className="grid min-h-[600px] lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative flex flex-col justify-between bg-gradient-to-br from-[#262522] via-[#22211e] to-[#1c1b18] p-8 text-white sm:p-10 lg:p-12 border-b lg:border-b-0 lg:border-r border-neutral-800">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-bold text-orange-300">
                <MailCheck size={15} />
                ServiceHub Account Verification
              </div>

              <h1 className="mt-6 text-3xl font-extrabold leading-tight sm:text-4xl text-[#f2efe9] font-serif tracking-tight">
                One last step to unlock your account.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-7 text-[#b4b0a9] sm:text-base">
                We’re confirming your email address so you can securely book and offer services in Cordova.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-neutral-800 bg-[#141412]/60 p-5 backdrop-blur-sm">
              <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">What happens next?</p>
              <ul className="mt-3 space-y-2.5 text-sm text-[#d6d3cd]">
                <li className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-orange-500" />
                  Your email is confirmed and verified.
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-orange-400" />
                  You’ll be redirected automatically to sign in.
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Your account is unlocked and ready to use.
                </li>
              </ul>
            </div>
          </section>

          <section className="flex items-center justify-center bg-[#faf8f5] dark:bg-[#191919] p-6 sm:p-8 lg:p-10">
            <div className="w-full max-w-md rounded-[28px] border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#22211e] p-7 shadow-sm sm:p-8">
              <div
                className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${
                  isSuccess
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : isError
                      ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                      : "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20"
                }`}
              >
                {status === "loading" ? (
                  <LoaderCircle size={30} className="animate-spin" />
                ) : isSuccess ? (
                  <CheckCircle2 size={30} />
                ) : (
                  <CircleAlert size={30} />
                )}
              </div>

              <div className="mt-6 text-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {status === "loading"
                    ? "Verifying your email"
                    : isSuccess
                      ? "Email verified"
                      : "Verification issue"}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-[#b4b0a9]">
                  {message}
                </p>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-[#1c1b18] p-4 text-xs text-slate-600 dark:text-[#b4b0a9] text-center">
                {status === "loading" ? (
                  <p>Please wait while we complete the verification securely.</p>
                ) : isSuccess ? (
                  <p>Redirecting you to the login page shortly...</p>
                ) : (
                  <p>Return to login and request a fresh verification link if needed.</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => router.push("/login")}
                className="mt-6 flex w-full items-center justify-center rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-[0.98] px-4 py-3 text-sm font-bold text-white shadow-sm transition-all cursor-pointer"
              >
                {status === "loading" ? "Continue to login" : "Go to login"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#faf8f5]">
          <LoaderCircle size={36} className="animate-spin text-orange-500" />
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}