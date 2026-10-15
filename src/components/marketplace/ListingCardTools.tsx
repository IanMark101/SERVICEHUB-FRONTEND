'use client';

import { BookmarkSimple } from '@phosphor-icons/react';
import ContentCaseAction from '../moderation/ContentCaseAction';
import type { SavedListingType } from '../../api/savedListings.api';
import styles from './ListingCardTools.module.css';

export interface ListingSaveProps { saved?: boolean; saving?: boolean; onToggleSaved?: () => void }

export default function ListingCardTools({ contentType, listingId, isOwned, isDark, saved, saving, onToggleSaved, compact = false }: ListingSaveProps & {
  contentType: SavedListingType; listingId: string; isOwned: boolean; isDark: boolean; compact?: boolean;
}) {
  if (isOwned) return null;
  return <div className={styles.tools} data-compact={compact || undefined} aria-label="Listing actions">
    {onToggleSaved && <button type="button" className={styles.button} aria-pressed={saved === true}
      aria-label={saved ? 'Remove from Saved' : 'Save listing'}
      title={saved === undefined ? 'Saved status is loading or unavailable' : saved ? 'Remove from Saved' : 'Save listing'}
      disabled={saved === undefined || saving} onClick={onToggleSaved}>
      <BookmarkSimple size={18} weight={saved ? 'fill' : 'regular'} aria-hidden="true" />
      <span className={compact ? 'sr-only' : undefined}>{saving ? 'Saving...' : saved ? 'Saved' : 'Save'}</span>
    </button>}
    <ContentCaseAction caseType="REPORT" contentType={contentType} resourceId={listingId}
      variant={compact ? 'icon' : 'button'} label="Report listing" className={`${styles.button} ${styles.report}`} isDark={isDark} />
  </div>;
}
