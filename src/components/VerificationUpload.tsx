"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Shield, Upload, CheckCircle2, Clock, XCircle, ExternalLink, AlertTriangle, Image as ImageIcon, FileCheck, Trash2, Camera, Plus, Eye } from 'lucide-react';
import { apiSubmitVerification, apiGetVerificationStatus } from '../api/verifications.api';
import { useToast } from './Toast';

interface VerificationUploadProps {
  isDark: boolean;
  onClose?: () => void;
}

interface DocumentRow {
  fileUrl: string;
  fileName?: string;
  documentType: string;
  isCustomUrl?: boolean;
}

const DOCUMENT_TYPES = [
  { value: 'GOVERNMENT_ID', label: 'Government-Issued ID (PhilSys, Driver\'s License, Passport)' },
  { value: 'PROOF_OF_RESIDENCE', label: 'Proof of Residence (Barangay Cert, Utility Bill)' },
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
  const [rows, setRows] = useState<DocumentRow[]>([{ fileUrl: '', documentType: 'GOVERNMENT_ID' }]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
  
  const updateRow = (i: number, field: keyof DocumentRow, value: any) =>
    setRows(r => r.map((row, idx) => idx === i ? { ...row, [field]: value } : row));

  const handleFileUpload = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      toastError('File too large', 'Please upload a photo under 12MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setRows(prev => prev.map((row, idx) => idx === i ? {
        ...row,
        fileUrl: dataUrl,
        fileName: file.name,
        isCustomUrl: false
      } : row));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    const valid = rows.filter(r => r.fileUrl.trim());
    if (valid.length === 0) {
      toastError('No documents', 'Please upload or attach at least one document photo.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiSubmitVerification(valid.map(v => ({ fileUrl: v.fileUrl, documentType: v.documentType })));
      if (res.success) {
        success('Verification Submitted!', 'Admin will review your photos & documents.');
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
    borderRadius: '12px',
    padding: '10px 14px',
    fontSize: '12px',
    outline: 'none',
    width: '100%',
  };

  return (
    <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '24px', padding: '24px', maxWidth: '600px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '14px', padding: '10px', color: '#10b981', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
          <Shield size={22} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: textPrimary }}>Identity & Residency Verification</h3>
          <p style={{ margin: 0, fontSize: '11px', color: textMuted }}>Upload official document photos to get approved for marketplace services</p>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: textMuted, fontSize: '20px', fontWeight: 'bold' }}>×</button>
        )}
      </div>

      {/* Current Status Badge */}
      <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: '14px', padding: '14px 16px', marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ color: cfg.color }}>{cfg.icon}</span>
        <div>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: cfg.color }}>{cfg.label}</p>
          {adminNote && <p style={{ margin: '3px 0 0', fontSize: '11px', color: textMuted }}>Admin note: {adminNote}</p>}
        </div>
      </div>

      {loadingStatus ? (
        <p style={{ fontSize: '12px', color: textMuted, textAlign: 'center', padding: '20px 0' }}>Loading verification status…</p>
      ) : status === 'APPROVED' ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: '#10b981', fontWeight: 800, fontSize: '14px' }}>You are a Verified Resident User!</p>
          <p style={{ color: textMuted, fontSize: '12px', marginTop: '6px' }}>Your account is fully verified and unrestricted on Cordova ServiceHub.</p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', background: isDark ? '#262420' : '#fefce8', padding: '12px', borderRadius: '12px', border: `1px solid ${isDark ? '#3a3730' : '#fef08a'}` }}>
              <AlertTriangle size={16} color="#f59e0b" style={{ flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: '11.5px', color: isDark ? '#d4d0c7' : '#854d0e', lineHeight: 1.4 }}>
                Please upload clear photos of your official ID or documents (PhilSys, Barangay Cert, Utility Bill). Photos will be reviewed securely by Admins.
              </p>
            </div>

            {/* Document Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {rows.map((row, i) => (
                <div key={i} style={{ background: isDark ? '#23221e' : '#f8fafc', border: `1px solid ${isDark ? '#33312c' : '#e2e8f0'}`, borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  
                  {/* Select Document Type */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: textMuted, marginBottom: '6px' }}>
                        Document Type #{i + 1}
                      </label>
                      <select
                        value={row.documentType}
                        onChange={e => updateRow(i, 'documentType', e.target.value)}
                        style={inputStyle}
                      >
                        {DOCUMENT_TYPES.map(dt => (
                          <option key={dt.value} value={dt.value}>{dt.label}</option>
                        ))}
                      </select>
                    </div>

                    {rows.length > 1 && (
                      <button
                        onClick={() => removeRow(i)}
                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '8px 10px', borderRadius: '10px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', alignSelf: 'flex-end' }}
                        title="Remove Document"
                      >
                        <Trash2 size={14} />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  {/* Photo File Upload Box */}
                  <div>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      ref={el => { fileInputRefs.current[i] = el; }}
                      style={{ display: 'none' }}
                      onChange={e => handleFileUpload(i, e)}
                    />

                    {row.fileUrl ? (
                      <div style={{ background: isDark ? '#1c1b18' : '#ffffff', border: `1px solid ${isDark ? '#383632' : '#cbd5e1'}`, borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {row.fileUrl.startsWith('data:image/') || row.fileUrl.match(/\.(png|jpg|jpeg|webp)$/i) ? (
                          <div style={{ position: 'relative', width: '56px', height: '56px', borderRadius: '10px', overflow: 'hidden', border: `1px solid ${isDark ? '#3a3835' : '#e2e8f0'}`, flexShrink: 0 }}>
                            <img src={row.fileUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button
                              onClick={() => setPreviewModalUrl(row.fileUrl)}
                              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyCenter: 'center', opacity: 0.9 }}
                              title="Zoom Preview"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        ) : (
                          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: '#10b981', flexShrink: 0 }}>
                            <FileCheck size={22} />
                          </div>
                        )}

                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {row.fileName || 'Document Attached'}
                          </p>
                          <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 600 }}>Ready to submit</span>
                        </div>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => fileInputRefs.current[i]?.click()}
                            style={{ background: isDark ? '#2a2927' : '#f1f5f9', border: `1px solid ${isDark ? '#3a3835' : '#e2e8f0'}`, color: textPrimary, padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Change Photo
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRefs.current[i]?.click()}
                        style={{ border: `2px dashed ${isDark ? '#3a3730' : '#cbd5e1'}`, borderRadius: '14px', padding: '20px', textAlign: 'center', cursor: 'pointer', background: isDark ? 'rgba(255,255,255,0.015)' : '#ffffff', transition: 'all 0.2s' }}
                      >
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: isDark ? '#2a2927' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyCenter: 'center', margin: '0 auto 10px', color: isDark ? '#10b981' : '#059669' }}>
                          <Camera size={22} />
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: textPrimary }}>
                          Click to Upload Photo / File
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: '11px', color: textMuted }}>
                          Supports JPG, PNG, WEBP, or PDF (up to 12MB)
                        </p>
                      </div>
                    )}

                    {/* Fallback URL Toggle */}
                    <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                      {!row.isCustomUrl ? (
                        <button
                          type="button"
                          onClick={() => updateRow(i, 'isCustomUrl', true)}
                          style={{ background: 'none', border: 'none', color: textMuted, fontSize: '10.5px', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          Or paste a web document link instead
                        </button>
                      ) : (
                        <div style={{ width: '100%', marginTop: '6px' }}>
                          <input
                            type="url"
                            placeholder="https://..."
                            value={row.fileUrl}
                            onChange={e => updateRow(i, 'fileUrl', e.target.value)}
                            style={inputStyle}
                          />
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              ))}
            </div>

            {/* Add Document button */}
            <button
              type="button"
              onClick={addRow}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', padding: '10px 0 0', marginTop: '4px' }}
            >
              <Plus size={16} />
              <span>Add another document photo</span>
            </button>
          </div>

          {/* Submit Action Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '14px',
              background: submitting ? '#4b5563' : 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              color: '#fff',
              fontWeight: 800,
              fontSize: '13.5px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
              transition: 'all 0.2s',
            }}
          >
            {submitting ? 'Submitting Photos…' : status === 'REJECTED' ? 'Resubmit Documents for Review' : 'Submit for Verification'}
          </button>
        </>
      )}

      {/* Image Zoom Preview Modal */}
      {previewModalUrl && (
        <div onClick={() => setPreviewModalUrl(null)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyCenter: 'center', padding: '20px' }}>
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img src={previewModalUrl} alt="Document Zoom" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '12px', objectFit: 'contain' }} />
            <button onClick={() => setPreviewModalUrl(null)} style={{ position: 'absolute', top: '-16px', right: '-16px', background: '#ef4444', color: '#fff', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>×</button>
          </div>
        </div>
      )}
    </div>
  );
}
