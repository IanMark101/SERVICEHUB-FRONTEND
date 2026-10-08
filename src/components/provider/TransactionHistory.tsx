import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePagination } from '../../hooks/usePagination';
import PaginationBar from '../ui/PaginationBar';

export default function TransactionHistory({ currentUserId = 'u3' }: { currentUserId?: string }) {
  const { transactions, isDark, hasMoreTransactions, loadMoreTransactions } = useApp();
  const [filterDate, setFilterDate] = useState<string>('');
  const searchParams = useSearchParams();
  const bookingIdParam = searchParams.get('booking');
  const [highlightedBookingId, setHighlightedBookingId] = useState<string | null>(null);
  const appliedBookingLink = useRef<string | null>(null);

  // Filter transactions for currentUserId (as provider OR seeker)
  const myTransactions = useMemo(() => transactions.filter(tx => {
    const isMine = tx.providerId === currentUserId || tx.seekerId === currentUserId;
    const matchesDate = !filterDate || tx.createdAt === filterDate;
    return isMine && matchesDate;
  }), [transactions, currentUserId, filterDate]);

  // Calculate total earnings
  const totalEarnings = myTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedTransactions,
    goToPage,
    nextPage,
    prevPage,
    startIndex,
    endIndex
  } = usePagination(myTransactions, 8);

  useEffect(() => {
    if (bookingIdParam && appliedBookingLink.current !== bookingIdParam) {
      const idx = myTransactions.findIndex(tx => tx.jobId === bookingIdParam);
      if (idx !== -1) {
        const targetPage = Math.floor(idx / 8) + 1;
        const stateTimer = window.setTimeout(() => {
          appliedBookingLink.current = bookingIdParam;
          goToPage(targetPage);
          setHighlightedBookingId(bookingIdParam);
        }, 0);

        return () => {
          window.clearTimeout(stateTimer);
        };
      }
    } else if (!bookingIdParam) {
      appliedBookingLink.current = null;
    }
  }, [bookingIdParam, myTransactions, goToPage]);

  useEffect(() => {
    if (!highlightedBookingId) return;
    const timer = window.setTimeout(() => setHighlightedBookingId(null), 3400);
    return () => window.clearTimeout(timer);
  }, [highlightedBookingId]);

  return (
    <div className={`space-y-6 select-none transition-colors duration-200 ${isDark ? 'text-white' : 'text-ink'}`}>



      {/* Date filter row */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-[24px] p-5 border shadow-sm transition-colors duration-200 ${
        isDark ? 'bg-charcoal-surface border-neutral-800/80' : 'bg-white border-slate-200'
      }`}>
        <div>
          <span className={`text-[9px] font-bold uppercase tracking-widest block mb-0.5 ${isDark ? 'text-ink-muted' : 'text-ink-subtle'}`}>Total Earnings</span>
          <span className={`text-2xl font-extrabold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>₱{totalEarnings}</span>
        </div>

        <div className={`form-control-group flex items-center rounded-xl px-3 py-2 text-xs border ${
          isDark ? 'bg-charcoal-inset border-neutral-850' : 'bg-slate-50 border-slate-200'
        }`}>
          <Calendar className={`w-4 h-4 mr-1.5 ${isDark ? 'text-ink-muted' : 'text-ink-subtle'}`} />
          <input
            data-form-unstyled
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className={`bg-transparent border-none text-xs focus:outline-none w-28 select-none ${
              isDark ? 'text-white color-scheme-dark' : 'text-ink'
            }`}
            placeholder="mm/dd/yyyy"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate('')}
              className={`font-bold ml-1 transition-colors ${isDark ? 'text-ink-muted hover:text-white' : 'text-ink-subtle hover:text-ink-secondary'}`}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Ledger Rows */}
      {myTransactions.length === 0 ? (
        <div className={`rounded-[24px] p-12 border text-center text-sm font-medium transition-colors duration-200 ${
          isDark ? 'bg-charcoal-surface border-neutral-800/80 text-ink-muted' : 'bg-white border-slate-200 text-ink-muted'
        }`}>
          No transaction history found.
        </div>
      ) : (
        <div className={`rounded-[24px] border overflow-hidden shadow-sm transition-colors duration-200 ${
          isDark ? 'bg-charcoal-surface border-neutral-800/80' : 'bg-white border-slate-200'
        }`}>

          {/* Navigation layout strips */}
          <div className="relative p-5 space-y-4">

            {/* Arrows decorations */}
            <div className="absolute top-1/2 -left-4 -translate-y-1/2 hidden md:block">
              <button className={`w-8 h-8 rounded-full border flex items-center justify-center shadow transition-all active:scale-90 ${
                isDark ? 'border-neutral-800 bg-charcoal-inset text-ink-muted hover:text-white' : 'border-slate-200 bg-white text-ink-subtle hover:text-ink-secondary'
              }`}>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="absolute top-1/2 -right-4 -translate-y-1/2 hidden md:block">
              <button className={`w-8 h-8 rounded-full border flex items-center justify-center shadow transition-all active:scale-90 ${
                isDark ? 'border-neutral-800 bg-charcoal-inset text-ink-muted hover:text-white' : 'border-slate-200 bg-white text-ink-subtle hover:text-ink-secondary'
              }`}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {paginatedTransactions.map((tx) => {
              const formattedDate = new Date(tx.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              const isHighlighted = highlightedBookingId && tx.jobId === highlightedBookingId;

              return (
                <div
                  key={tx.id}
                  id={`transaction-${tx.jobId}`}
                  className={`border rounded-2xl p-4 flex min-w-0 flex-col gap-3 transition-all duration-500 sm:flex-row sm:items-center sm:justify-between ${
                    isHighlighted
                      ? (isDark ? 'border-orange-500 bg-orange-950/10 ring-1 ring-orange-500/30' : 'border-orange-400 bg-orange-50/70 ring-1 ring-orange-400/40')
                      : isDark
                      ? 'bg-charcoal-inset border-neutral-850 hover:border-neutral-800'
                      : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="min-w-0 space-y-1">
                    <h4 className={`break-words font-extrabold text-xs ${isDark ? 'text-white' : 'text-ink'}`}>
                      {tx.serviceTitle}
                    </h4>

                    <div className={`flex flex-wrap items-center gap-2 text-[10px] font-bold ${isDark ? 'text-ink-muted' : 'text-ink-subtle'}`}>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formattedDate}
                      </span>
                      <span>•</span>

                      {tx.paymentMethod !== 'On-site Cash' ? (
                        <span className={`inline-flex items-center text-[9px] px-2 py-0.5 rounded border uppercase tracking-wider font-bold ${
                          isDark
                            ? 'text-blue-400 bg-blue-950/20 border-blue-900/30'
                            : 'text-blue-600 bg-blue-50 border-blue-100'
                        }`}>
                          {tx.paymentMethod}
                        </span>
                      ) : (
                        <span className={`inline-flex items-center text-[9px] px-2 py-0.5 rounded border uppercase tracking-wider font-bold ${
                          isDark
                            ? 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30'
                            : 'text-emerald-600 bg-emerald-50 border-emerald-100'
                        }`}>
                          On-Site Cash
                        </span>
                      )}
                    </div>
                  </div>

                  <span className={`self-end whitespace-nowrap text-sm font-extrabold sm:self-auto ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    + ₱{tx.amount}
                  </span>

                </div>
              );
            })}

          </div>

          <div className="p-4 border-t border-slate-100 dark:border-neutral-850">
      <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              goToPage={goToPage}
              nextPage={nextPage}
              prevPage={prevPage}
              startIndex={startIndex}
              endIndex={endIndex}
              totalItems={myTransactions.length}
              variant="provider"
      />
      {hasMoreTransactions && (
        <div className="flex justify-center">
          <button type="button" onClick={loadMoreTransactions} className="rounded-xl border border-emerald-500/30 px-4 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            Load older payment records
          </button>
        </div>
      )}
          </div>

        </div>
      )}

    </div>
  );
}
