"use client";

import { apiResetPassword } from "@/api/auth.api";
import { CheckCircle2, CircleAlert, KeyRound, LoaderCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const validate = () => {
    if (!token) return "Reset token is missing. Please use the link from your email.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (!/\d/.test(password)) return "Password must contain at least one number.";
    if (password !== confirm) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setStatus("error"); setMessage(err); return; }

    setStatus("loading");
    setMessage("");

    try {
      const res = await apiResetPassword({ token, password });
      setStatus("success");
      setMessage(res.message || "Password reset successfully. You can now log in.");
      setTimeout(() => router.push("/login"), 3000);
    } catch (error: any) {
      setStatus("error");
      setMessage(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Reset link is invalid or has expired. Please request a new one."
      );
    }
  };

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
          {/* Left panel */}
          <section className="relative flex flex-col justify-between bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#0f172a] p-8 text-white sm:p-10 lg:p-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-orange-200">
                <KeyRound size={16} />
                Password reset
              </div>

              <h1 className="mt-6 text-3xl font-semibold leading-tight sm:text-4xl">
                Create your new password.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-7 text-slate-300 sm:text-base">
                Choose a strong password for your ServiceHub Cordova account. Your new password will invalidate all existing sessions.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm text-slate-300">Password requirements</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-200">
                <li className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
                  At least 8 characters long.
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  Contains at least one number.
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
                  Both fields must match exactly.
                </li>
              </ul>
            </div>
          </section>

          {/* Right panel — form */}
          <section className="flex items-center justify-center bg-[#fcfbf8] p-6 sm:p-8 lg:p-10">
            <div className="w-full max-w-md rounded-[28px] border border-slate-200/80 bg-white p-7 shadow-[0_18px_45px_-20px_rgba(15,23,42,0.2)] sm:p-8">
              {isSuccess ? (
                <>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 size={30} />
                  </div>
                  <div className="mt-6 text-center">
                    <h2 className="text-2xl font-semibold text-slate-900">Password reset!</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{message}</p>
                    <p className="mt-2 text-xs text-slate-400">Redirecting you to login...</p>
                  </div>
                  <button
                    onClick={() => router.push("/login")}
                    className="mt-8 flex w-full items-center justify-center rounded-2xl bg-[#f97316] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#ea580c]"
                  >
                    Go to Login
                  </button>
                </>
              ) : (
                <>
                  <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${isError ? "bg-rose-50 text-rose-600" : "bg-orange-50 text-orange-600"}`}>
                    {isError ? <CircleAlert size={30} /> : <KeyRound size={30} />}
                  </div>

                  <div className="mt-6 text-center">
                    <h2 className="text-2xl font-semibold text-slate-900">
                      {isError && !token ? "Invalid link" : "Set new password"}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Enter and confirm your new password below.
                    </p>
                  </div>

                  {isError && (
                    <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                      {message}
                    </div>
                  )}

                  {!token ? (
                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                      This reset link is invalid or missing a token. Please use the link from your email or{" "}
                      <button onClick={() => router.push("/login")} className="font-semibold text-orange-600 underline">
                        request a new one
                      </button>.
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min. 8 characters, 1 number"
                          required
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          placeholder="Repeat your new password"
                          required
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f97316] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#ea580c] disabled:opacity-60"
                      >
                        {status === "loading" ? (
                          <>
                            <LoaderCircle size={16} className="animate-spin" />
                            Resetting password...
                          </>
                        ) : (
                          "Reset Password"
                        )}
                      </button>
                    </form>
                  )}

                  <button
                    onClick={() => router.push("/login")}
                    className="mt-4 block w-full text-center text-xs text-slate-400 hover:text-slate-600"
                  >
                    Back to login
                  </button>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#faf8f5]">
          <LoaderCircle size={36} className="animate-spin text-orange-500" />
        </main>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
