"use client";
import React, { useState, useEffect } from 'react';
import { Shield, Upload, CheckCircle2, Clock, XCircle, ExternalLink, AlertTriangle } from 'lucide-react';
import { apiSubmitVerification, apiGetVerificationStatus } from '../api/verifications.api';
import { useToast } from './Toast';

interface VerificationUploadProps {
  isDark: boolean;
  onClose?: () => void;
}

const DOCUMENT_TYPES = [
  { value: 'GOVERNMENT_ID', label: 'Government-Issued ID (e.g., PhilSys, Driver\'s License, Passport)' },
  { value: 'PROOF_OF_RESIDENCE', label: 'Proof of Residence (e.g., Barangay Cert, Utility Bill)' },
  { value: 'SKILL_CERTIFICATE', label: 'Skill Certificate or Diploma' },
  { value: 'BUSINESS_PERMIT', label: 'Business Permit (if applicable)' },
];

const STATUS_CONFIG = {
  NOT_SUBMITTED: { icon: <Upload size={16} />, color: '#9ca3af', label: 'Not Submitted', bg: 'rgba(156,163,175,0.1)', border: 'rgba(156,163,175,0.3)' },
  PENDING_REVIEW: { icon: <Clock size={16} />, color: '#f59e0b', label: 'Under Review', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
  APPROVED: { icon: <CheckCircle2 size={16} />, color: '#10b981', label: 'Verified ✅', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
  REJECTED: { icon: <XCircle size={16} />, color: '#ef4444', label: 'Rejected — Please resubmit', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
};

export default function VerificationUpload({ isDark, onClose }: VerificationUploadProps) {
  const { success, error: toastError } = useToast();
  const [status, setStatus] = useState<keyof typeof STATUS_CONFIG>('NOT_SUBMITTED');
  const [adminNote, setAdminNote] = useState<string>('');
  const [rows, setRows] = useState([{ fileUrl: '', documentType: 'GOVERNMENT_ID' }]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    apiGetVerificationStatus()
      .then(res => {
        if (res.success && res.data) {
          setStatus(res.data.status || 'NOT_SUBMITTED');
          setAdminNote(res.data.adminNote || '');
        }
      })
      .catch(() => {})
      .finally(() => setLoadingStatus(false));
  }, []);

  const addRow = () => setRows(r => [...r, { fileUrl: '', documentType: 'GOVERNMENT_ID' }]);
  const removeRow = (i: number) => setRows(r => r.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: string, value: string) =>
    setRows(r => r.map((row, idx) => idx === i ? { ...row, [field]: value } : row));

  const handleSubmit = async () => {
    const valid = rows.filter(r => r.fileUrl.trim());
    if (valid.length === 0) {
      toastError('No documents', 'Please provide at least one document URL.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiSubmitVerification(valid);
      if (res.success) {
        success('Verification Submitted!', 'Admin will review your documents within 1–2 business days.');
        setStatus('PENDING_REVIEW');
      } else {
        toastError('Submission Failed', res.error || 'Please try again.');
      }
    } catch (e: any) {
      toastError('Submission Failed', e?.response?.data?.error || 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['NOT_SUBMITTED'];
  const cardBg = isDark ? '#1c1b18' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';
  const textPrimary = isDark ? '#f2efe9' : '#1e293b';
  const textMuted = isDark ? '#9a9690' : '#64748b';
  const inputStyle: React.CSSProperties = {
    background: isDark ? '#2a2927' : '#f8fafc',
    border: `1px solid ${isDark ? '#3a3835' : '#e2e8f0'}`,
    color: textPrimary,
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '12px',
    outline: 'none',
    width: '100%',
  };

  return (
    <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '16px', padding: '24px', maxWidth: '560px', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '8px', color: '#10b981' }}>
          <Shield size={20} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: textPrimary }}>Identity Verification</h3>
          <p style={{ margin: 0, fontSize: '11px', color: textMuted }}>Required to get approved service listings</p>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: textMuted, fontSize: '18px' }}>×</button>
        )}
      </div>

      {/* Current Status */}
      <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: '10px', padding: '12px 14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: cfg.color }}>{cfg.icon}</span>
        <div>
          <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: cfg.color }}>{cfg.label}</p>
          {adminNote && <p style={{ margin: '2px 0 0', fontSize: '11px', color: textMuted }}>Admin note: {adminNote}</p>}
        </div>
      </div>

      {loadingStatus ? (
        <p style={{ fontSize: '12px', color: textMuted, textAlign: 'center' }}>Loading status…</p>
      ) : status === 'APPROVED' ? (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <CheckCircle2 size={40} color="#10b981" style={{ margin: '0 auto 8px' }} />
          <p style={{ color: '#10b981', fontWeight: 600, fontSize: '13px' }}>You are a Verified Resident Provider!</p>
          <p style={{ color: textMuted, fontSize: '11px', marginTop: '4px' }}>Your listings can now be approved by admins.</p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <AlertTriangle size={14} color="#f59e0b" />
              <p style={{ margin: 0, fontSize: '11px', color: textMuted }}>
                Upload public links (Google Drive, Imgur, etc.) to your documents. Do not share sensitive personal info beyond what is required.
              </p>
            </div>

            {rows.map((row, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <select
                  value={row.documentType}
                  onChange={e => updateRow(i, 'documentType', e.target.value)}
                  style={{ ...inputStyle, width: '180px', flexShrink: 0 }}
                >
                  {DOCUMENT_TYPES.map(dt => (
                    <option key={dt.value} value={dt.value}>{dt.label}</option>
                  ))}
                </select>
                <input
                  type="url"
                  placeholder="Paste document URL…"
                  value={row.fileUrl}
                  onChange={e => updateRow(i, 'fileUrl', e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  onClick={() => window.open(row.fileUrl, '_blank')}
                  disabled={!row.fileUrl}
                  style={{ background: 'none', border: 'none', cursor: row.fileUrl ? 'pointer' : 'default', color: row.fileUrl ? '#6366f1' : '#555', padding: '4px' }}
                  title="Preview link"
                >
                  <ExternalLink size={14} />
                </button>
                {rows.length > 1 && (
                  <button onClick={() => removeRow(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px', fontSize: '16px' }}>×</button>
                )}
              </div>
            ))}

            <button
              onClick={addRow}
              style={{ fontSize: '11px', color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', marginTop: '4px' }}
            >
              + Add another document
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: '10px',
              background: submitting ? '#4b5563' : 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              fontSize: '13px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {submitting ? 'Submitting…' : status === 'REJECTED' ? 'Resubmit for Review' : 'Submit for Verification'}
          </button>
        </>
      )}
    </div>
  );
}
