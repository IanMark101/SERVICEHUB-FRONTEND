import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#0a0a0a] flex items-center justify-center p-6 transition-colors duration-300 font-sans">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-orange-500/10 dark:bg-orange-500/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-orange-500/10 dark:bg-orange-500/20 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-white dark:bg-[#191919] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-8 text-center shadow-lg relative z-10 transition-all duration-300">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-500/10 text-[#FF5A1F] mb-6">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-[#f2efe9] tracking-tight mb-2">
          Terms of Service
        </h1>
        <p className="text-slate-500 dark:text-[#b4b0a9] text-sm mb-6 leading-relaxed">
          The ServiceHub Cordova Terms of Service are currently being finalized to align with hyperlocal resident rules. Please check back soon.
        </p>

        <Link
          href="/register"
          className="inline-block px-6 py-2.5 bg-[#FF5A1F] hover:bg-[#e04f1a] active:scale-[0.98] text-white rounded-lg font-bold text-sm shadow-sm transition-all cursor-pointer"
        >
          Back to Sign Up
        </Link>
      </div>
    </div>
  );
}
