'use client';

import type { LocationPoint } from '../../../lib/location';
import LocationField from '../../location/LocationField';
import CoverageField from '../../location/CoverageField';
import TransportationField from '../../location/TransportationField';

import FormSelect from '../../ui/FormSelect';
import React, { useEffect, type FormEvent } from 'react';
import { X } from '@phosphor-icons/react';
import type { ServiceListing } from '../../../types';
import ListingTitleInput from '../../ui/ListingTitleInput';

export interface EditServiceState {
  serviceLocation?: LocationPoint | null;
  coverageRadiusKm?: number | null;
  transportationFee?: string;
  serviceId: string;
  title: string;
  price: number;
  priceType: NonNullable<ServiceListing['priceType']>;
  serviceType: NonNullable<ServiceListing['serviceType']>;
  estimatedDurationMins: number;
  description: string;
  paymentMethods: { cash: boolean; gcash: boolean };
}

interface Props {
  value: EditServiceState | null;
  isDark: boolean;
  hasMobileNumber: boolean;
  onChange: (value: EditServiceState) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
  onOpenProfile: () => void;
}

export default function EditServiceModal({
  value,
  isDark,
  hasMobileNumber,
  onChange,
  onClose,
  onSubmit,
  onOpenProfile,
}: Props) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (value) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [value, onClose]);

  if (!value) return null;

  const field = `w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none font-medium ${
    isDark
      ? 'bg-charcoal border-neutral-800 text-white placeholder:text-neutral-600 focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/10'
      : 'bg-slate-50/80 border-slate-200 text-ink placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10'
  }`;

  const label = `text-xs font-semibold mb-1.5 block ${
    isDark ? 'text-neutral-300' : 'text-ink-secondary'
  }`;

  const hasPaymentMethod = Object.values(value.paymentMethods).some(Boolean);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-service-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-6 bg-charcoal/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className={`relative w-full max-w-lg max-h-[90dvh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all duration-200 ${
          isDark
            ? 'bg-charcoal-inset border-neutral-800 text-white'
            : 'bg-white border-slate-200/80 text-ink'
        }`}
      >
        {/* Modal Top Bar */}
        <div
          className={`flex items-center justify-between px-6 py-4.5 border-b ${
            isDark ? 'border-neutral-800 bg-charcoal-surface/60' : 'border-slate-100 bg-slate-50/70'
          }`}
        >
          <h3 id="edit-service-modal-title" className="font-extrabold text-base tracking-tight">
            Edit Service Listing
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              isDark
                ? 'text-neutral-400 hover:text-white hover:bg-charcoal'
                : 'text-ink-subtle hover:text-ink hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={onSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-4.5">
            <div>
              <label className={label}>Listing Title</label>
              <ListingTitleInput
                className={field}
                required
                minLength={10}
                maxLength={100}
                value={value.title}
                onChange={(e) => onChange({ ...value, title: e.target.value })}
              />
            </div>

            <div>
              <label className={label}>Pricing Unit</label>
              <div className="relative">
                <FormSelect
                  aria-label="Pricing Unit"
                  className={`${field} appearance-none pr-10 cursor-pointer`}
                  value={value.priceType === 'PER_SESSION' ? 'FIXED' : value.priceType}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      serviceType: 'ONE_TIME',
                      priceType: e.target.value as EditServiceState['priceType'],
                    })
                  }
                >
                  <option value="FIXED">Fixed Price</option>
                  <option value="PER_HOUR">Per Hour</option>
                  <option value="PER_DAY">Per Day</option>
                  <option value="PER_PROJECT">Per Project</option>
                </FormSelect>
              </div>
              <p className={`mt-1.5 text-xs leading-relaxed ${isDark ? 'text-neutral-400' : 'text-ink-muted'}`}>
                Enter the amount the seeker will pay, or an exact unit rate. Each booking is a separate one-time job.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={label}>Price (PHP)</label>
                <input
                  className={field}
                  type="number"
                  min={50}
                  max={50000}
                  required
                  value={value.price}
                  onChange={(e) => onChange({ ...value, price: Number(e.target.value) })}
                />
              </div>

              <div>
                <label className={label}>Estimated Duration (minutes)</label>
                <input
                  className={field}
                  type="number"
                  min={15}
                  max={480}
                  required
                  value={value.estimatedDurationMins}
                  onChange={(e) => onChange({ ...value, estimatedDurationMins: Number(e.target.value) })}
                />
              </div>
            </div>

            <CoverageField isDark={isDark} value={value.coverageRadiusKm} onChange={coverageRadiusKm => onChange({ ...value, coverageRadiusKm })} />
            <LocationField label="Service operating base" workspace="provider" value={value.serviceLocation ?? null} radiusKm={value.coverageRadiusKm} onChange={serviceLocation => onChange({ ...value, serviceLocation })} />
            {!value.serviceLocation && <p className="text-xs text-ink-muted">Add a location to include this older listing in nearby discovery.</p>}
            <TransportationField isDark={isDark} value={value.transportationFee ?? ''} onChange={transportationFee => onChange({ ...value, transportationFee })} />
            <div>
              <label className={label}>Description</label>
              <textarea
                className={`${field} resize-none leading-relaxed`}
                rows={4}
                required
                minLength={30}
                maxLength={1000}
                value={value.description}
                onChange={(e) => onChange({ ...value, description: e.target.value })}
              />
            </div>

            <div>
              <span className={label}>Accepted Payment Methods</span>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 mt-1">
                {(
                  [
                    ['cash', 'On-site Cash'],
                    ['gcash', 'GCash · PayMongo Test Mode'],
                  ] as const
                ).map(([key, text]) => {
                  const isChecked = value.paymentMethods[key];
                  return (
                    <label
                      key={key}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                        isChecked
                          ? isDark
                            ? 'bg-emerald-950/20 border-emerald-900/50 text-white shadow-xs'
                            : 'bg-emerald-50/50 border-emerald-300 text-emerald-950 shadow-xs'
                          : isDark
                          ? 'bg-charcoal border-neutral-800 text-neutral-400 hover:border-neutral-700'
                          : 'bg-slate-50/70 border-slate-200 text-ink-muted hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) =>
                          onChange({
                            ...value,
                            paymentMethods: { ...value.paymentMethods, [key]: e.target.checked },
                          })
                        }
                        className="h-4 w-4 rounded accent-emerald-600 cursor-pointer"
                      />
                      <span className="text-xs font-semibold">{text}</span>
                    </label>
                  );
                })}
              </div>
              {!hasPaymentMethod && (
                <p className="mt-1.5 text-xs text-red-500 font-medium">Select at least one payment method.</p>
              )}
              {value.paymentMethods.gcash && !hasMobileNumber && (
                <div
                  className={`mt-2.5 rounded-2xl border p-3.5 text-xs ${
                    isDark
                      ? 'border-amber-900/40 bg-amber-950/20 text-amber-200'
                      : 'border-amber-200 bg-amber-50 text-amber-900'
                  }`}
                >
                  <p className="leading-relaxed">
                    <span className="font-bold">Your mobile contact information is incomplete.</span> PayMongo Test Mode records an internal earning and does not pay a personal GCash number.
                  </p>
                  <button
                    type="button"
                    onClick={onOpenProfile}
                    className="mt-2 rounded-xl border border-current px-3 py-1.5 font-bold hover:bg-amber-500/10 transition-colors cursor-pointer"
                  >
                    Add mobile number
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer with Soft Divider */}
          <div
            className={`px-6 py-4 border-t flex items-center justify-end gap-2.5 ${
              isDark ? 'border-neutral-800 bg-charcoal-surface/60' : 'border-slate-100 bg-slate-50/70'
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                isDark
                  ? 'border-neutral-700 bg-charcoal text-neutral-200 hover:bg-charcoal'
                  : 'border-slate-200 bg-white text-ink-secondary hover:bg-slate-100'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!hasPaymentMethod}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition-all active:scale-98 shadow-md hover:shadow-emerald-500/25 cursor-pointer disabled:cursor-not-allowed"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
