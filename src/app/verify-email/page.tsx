"use client";

import { apiVerifyEmail } from "@/api/auth.api";
import { CheckCircle2, CircleAlert, LoaderCircle, MailCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyEmailPage() {
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#faf8f5] px-4 py-8 text-slate-800 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-orange-500/15 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-emerald-500/15 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-[0_30px_90px_-25px_rgba(15,23,42,0.25)] backdrop-blur-xl">
        <div className="grid min-h-[640px] lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative flex flex-col justify-between bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#0f172a] p-8 text-white sm:p-10 lg:p-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-orange-200">
                <MailCheck size={16} />
                ServiceHub account verification
              </div>

              <h1 className="mt-6 text-3xl font-semibold leading-tight sm:text-4xl">
                One last step to unlock your account.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-7 text-slate-300 sm:text-base">
                We’re finishing the last verification step for your new account so you can continue securely.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm text-slate-300">What happens next?</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-200">
                <li className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
                  Your email will be confirmed securely.
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  You’ll be redirected back to sign in.
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
                  Your account will be ready to use immediately.
                </li>
              </ul>
            </div>
          </section>

          <section className="flex items-center justify-center bg-[#fcfbf8] p-6 sm:p-8 lg:p-10">
            <div className="w-full max-w-md rounded-[28px] border border-slate-200/80 bg-white p-7 shadow-[0_18px_45px_-20px_rgba(15,23,42,0.2)] sm:p-8">
              <div
                className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${
                  isSuccess
                    ? "bg-emerald-50 text-emerald-600"
                    : isError
                      ? "bg-rose-50 text-rose-600"
                      : "bg-orange-50 text-orange-600"
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
                <h2 className="text-2xl font-semibold text-slate-900">
                  {status === "loading"
                    ? "Verifying your email"
                    : isSuccess
                      ? "Email verified"
                      : "Verification issue"}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  {message}
                </p>
              </div>

              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                {status === "loading" ? (
                  <p>
                    Please wait while we complete the verification securely.
                  </p>
                ) : isSuccess ? (
                  <p>You’ll be redirected to the login page in a moment.</p>
                ) : (
                  <p>Return to login and request a fresh verification link if needed.</p>
                )}
              </div>

              <button
                onClick={() => router.push("/login")}
                className="mt-6 flex w-full items-center justify-center rounded-2xl bg-[#f97316] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#ea580c]"
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