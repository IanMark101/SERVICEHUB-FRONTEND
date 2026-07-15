"use client";
import React from 'react';
import { ShieldCheck, Clock, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';

interface VerificationCardProps {
  verStatus: string;
  labelText: string;
  onTriggerVerification?: () => void;
}

export default function VerificationCard({
  verStatus,
  labelText,
  onTriggerVerification,
}: VerificationCardProps) {
  if (verStatus === 'APPROVED') {
    return (
      <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-emerald-500 uppercase tracking-wider">Verified Cordova Resident</h4>
            <p className={`text-xs ${labelText}`}>Your residency is officially verified. You have full access to transact and book services.</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500 text-white flex-shrink-0">
          APPROVED
        </span>
      </div>
    );
  }

  if (verStatus === 'PENDING_REVIEW') {
    return (
      <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center flex-shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-amber-500 uppercase tracking-wider">Verification Pending Review</h4>
            <p className={`text-xs ${labelText}`}>Your documents have been submitted and are under admin review. Approvals usually take under 24 hours.</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-500 text-white flex-shrink-0">
          PENDING
        </span>
      </div>
    );
  }

  if (verStatus === 'REJECTED') {
    return (
      <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center flex-shrink-0">
            <XCircle size={20} />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-rose-500 uppercase tracking-wider">Residency Verification Rejected</h4>
            <p className={`text-xs ${labelText}`}>Your submitted ID or Barangay proof could not be verified. Please resubmit valid proof.</p>
          </div>
        </div>
        <button
          onClick={onTriggerVerification}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white flex items-center gap-1.5 flex-shrink-0 transition-all active:scale-95"
        >
          <span>Resubmit</span>
          <ArrowRight size={14} />
        </button>
      </div>
    );
  }

  // UNVERIFIED / Limited Mode
  return (
    <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={18} />
        </div>
        <div>
          <h4 className="font-extrabold text-xs text-amber-500 uppercase tracking-wider mb-0.5">Limited Mode Active</h4>
          <p className={`text-xs ${labelText}`}>
            Complete residency verification to accept bookings, post requests, or offer service listings on ServiceHub.
          </p>
        </div>
      </div>
      <button
        onClick={onTriggerVerification}
        className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1.5 flex-shrink-0 transition-all shadow-sm active:scale-95 text-center"
      >
        <span>Verify Now</span>
        <ArrowRight size={14} />
      </button>
    </div>
  );
}
