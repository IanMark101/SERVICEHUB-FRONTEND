'use client';

import { useState } from 'react';
import { MagnifyingGlass, SlidersHorizontal, X } from '@phosphor-icons/react';
import FormSelect from '../../ui/FormSelect';
import { CASE_TYPES, CONCERNS, stateLabel } from './labels';
import type { CaseFilters } from './types';

export default function CaseFilterBar({ filters, search, onSearch, onChange, onClear }: {
  filters: CaseFilters; search: string; onSearch: (value: string) => void;
  onChange: (value: Partial<CaseFilters>) => void; onClear: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const extraFilters = [filters.status, filters.payment, filters.concern].filter(Boolean).length;
  const history = filters.view === 'history';
  const statuses = history ? ['RESOLVED', 'DISMISSED'] : filters.view === 'all' ? ['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'] : ['PENDING', 'UNDER_REVIEW'];
  const chips = [
    filters.status && { key: 'status' as const, label: `Status: ${stateLabel(filters.status)}` },
    filters.type && { key: 'type' as const, label: `Type: ${CASE_TYPES[filters.type]}` },
    filters.payment && { key: 'payment' as const, label: `Payment: ${filters.payment}` },
    filters.concern && { key: 'concern' as const, label: `Reported issue: ${CONCERNS[filters.concern]}` },
    search.trim() && { key: 'search' as const, label: `Search: ${search.trim()}` },
  ].filter(chip => !!chip);
  return <>
    <div className="case-toolbar">
      <label className="case-field case-search-label">Search cases<span className="case-search form-control-group"><MagnifyingGlass size={19} aria-hidden /><input data-form-unstyled value={search} maxLength={150} onChange={event => onSearch(event.target.value)} placeholder="Service, person, issue or case ID" type="search" /></span></label>
      <label className="case-field">Case type<FormSelect value={filters.type || ''} onChange={event => onChange({ type: event.target.value || undefined, concern: undefined })}><option value="">All case types</option>{Object.entries(CASE_TYPES).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</FormSelect></label>
      <label className="case-field case-sort">Sort cases<FormSelect value={filters.sort} onChange={event => onChange({ sort: event.target.value as CaseFilters['sort'] })}>
        {!history && <option value="attention">Pending first</option>}
        <option value="newest">{history ? 'Recently closed first' : 'Newest first'}</option><option value="oldest">{history ? 'Oldest closed first' : 'Oldest first'}</option>
      </FormSelect></label>
      <button type="button" className="case-button case-more-filters" aria-label="More filters" aria-expanded={expanded} aria-controls="case-more-filters" onClick={() => setExpanded(!expanded)}><SlidersHorizontal size={18} aria-hidden /> More filters{!!extraFilters && <span className="case-filter-indicator">{extraFilters}</span>}</button>
    </div>
    {expanded && <div id="case-more-filters" className="case-filters">
      <label className="case-field">Case status<FormSelect value={filters.status || ''} onChange={event => onChange({ status: event.target.value || undefined })}><option value="">{history ? 'All closed' : filters.view === 'all' ? 'All statuses' : 'All open'}</option>{statuses.map(value => <option key={value} value={value}>{stateLabel(value)}</option>)}</FormSelect></label>
      <label className="case-field">Payment method<FormSelect value={filters.payment || ''} onChange={event => onChange({ payment: event.target.value || undefined })}><option value="">All payment methods</option><option value="GCash">GCash</option><option value="On-site Cash">On-site Cash</option></FormSelect></label>
      <label className="case-field">Reported issue<FormSelect value={filters.concern || ''} onChange={event => onChange({ concern: event.target.value || undefined, type: event.target.value ? undefined : filters.type })}><option value="">All reported issues</option>{Object.entries(CONCERNS).slice(0,6).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</FormSelect></label>
    </div>}
    {!!chips.length && <div className="case-applied-filters"><div className="case-filter-chips">{chips.map(chip => <button key={chip.key} className="case-filter-chip" aria-label={`Remove ${chip.label}`} onClick={() => chip.key === 'search' ? onSearch('') : onChange({ [chip.key]: undefined })}><span>{chip.label}</span><X size={14} aria-hidden /></button>)}</div><button className="case-text-link" onClick={onClear}>Clear filters</button></div>}
  </>;
}
