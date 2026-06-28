import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, CreditCard, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePagination } from '../../hooks/usePagination';
import PaginationBar from '../PaginationBar';

export default function TransactionHistory({ currentUserId = 'u3' }: { currentUserId?: string }) {
  const { transactions, isDark } = useApp();
  const [filterDate, setFilterDate] = useState<string>('');

  // Filter transactions for currentUserId (as provider OR seeker)
  const myTransactions = transactions.filter(tx => {
    const isMine = tx.providerId === currentUserId || tx.seekerId === currentUserId;
    const matchesDate = !filterDate || tx.createdAt === filterDate;
    return isMine && matchesDate;
  });

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

  return (
    <div className={`space-y-6 select-none transition-colors duration-200 ${isDark ? 'text-[#f2efe9]' : 'text-slate-800'}`}>
      


      {/* Date filter row */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-[24px] p-5 border shadow-sm transition-colors duration-200 ${
        isDark ? 'bg-[#22211e] border-neutral-800/80' : 'bg-white border-slate-200'
      }`}>
        <div>
          <span className={`text-[9px] font-bold uppercase tracking-widest block mb-0.5 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}`}>Total Earnings</span>
          <span className={`text-2xl font-extrabold ${isDark ? 'text-emerald-450' : 'text-emerald-600'}`}>₱{totalEarnings}</span>
        </div>

        <div className={`flex items-center rounded-xl px-3 py-2 text-xs border ${
          isDark ? 'bg-[#1c1b18] border-neutral-850' : 'bg-slate-50 border-slate-200'
        }`}>
          <Calendar className={`w-4 h-4 mr-1.5 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}`} />
          <input 
            type="date" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className={`bg-transparent border-none text-xs focus:outline-none w-28 select-none ${
              isDark ? 'text-[#f2efe9] color-scheme-dark' : 'text-slate-800'
            }`}
            placeholder="mm/dd/yyyy"
          />
          {filterDate && (
            <button 
              onClick={() => setFilterDate('')}
              className={`font-bold ml-1 transition-colors ${isDark ? 'text-neutral-500 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Ledger Rows */}
      {myTransactions.length === 0 ? (
        <div className={`rounded-[24px] p-12 border text-center text-sm font-medium transition-colors duration-200 ${
          isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#b4b0a9]' : 'bg-white border-slate-200 text-slate-500'
        }`}>
          No transaction history found.
        </div>
      ) : (
        <div className={`rounded-[24px] border overflow-hidden shadow-sm transition-colors duration-200 ${
          isDark ? 'bg-[#22211e] border-neutral-800/80' : 'bg-white border-slate-200'
        }`}>
          
          {/* Navigation layout strips */}
          <div className="relative p-5 space-y-4">
            
            {/* Arrows decorations */}
            <div className="absolute top-1/2 -left-4 -translate-y-1/2 hidden md:block">
              <button className={`w-8 h-8 rounded-full border flex items-center justify-center shadow transition-all active:scale-90 ${
                isDark ? 'border-neutral-800 bg-[#1c1b18] text-[#b4b0a9] hover:text-white' : 'border-slate-200 bg-white text-slate-400 hover:text-slate-700'
              }`}>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
            
            <div className="absolute top-1/2 -right-4 -translate-y-1/2 hidden md:block">
              <button className={`w-8 h-8 rounded-full border flex items-center justify-center shadow transition-all active:scale-90 ${
                isDark ? 'border-neutral-800 bg-[#1c1b18] text-[#b4b0a9] hover:text-white' : 'border-slate-200 bg-white text-slate-400 hover:text-slate-700'
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

              return (
                <div 
                  key={tx.id}
                  className={`border rounded-2xl p-4 flex items-center justify-between transition-all ${
                    isDark 
                      ? 'bg-[#1c1b18] border-neutral-850 hover:border-neutral-800' 
                      : 'bg-slate-50 border-slate-100 hover:border-slate-250'
                  }`}
                >
                  <div className="space-y-1">
                    <h4 className={`font-extrabold text-xs ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                      {tx.serviceTitle}
                    </h4>
                    
                    <div className={`flex items-center space-x-2 text-[10px] font-bold ${isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}`}>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formattedDate}
                      </span>
                      <span>•</span>
                      
                      {tx.paymentMethod === 'GCash' ? (
                        <span className={`inline-flex items-center text-[9px] px-2 py-0.5 rounded border uppercase tracking-wider font-bold ${
                          isDark 
                            ? 'text-blue-400 bg-blue-950/20 border-blue-900/30' 
                            : 'text-blue-600 bg-blue-50 border-blue-100'
                        }`}>
                          GCash
                        </span>
                      ) : (
                        <span className={`inline-flex items-center text-[9px] px-2 py-0.5 rounded border uppercase tracking-wider font-bold ${
                          isDark 
                            ? 'text-emerald-450 bg-emerald-955/20 border-emerald-900/30' 
                            : 'text-emerald-600 bg-emerald-50 border-emerald-100'
                        }`}>
                          On-Site Cash
                        </span>
                      )}
                    </div>
                  </div>

                  <span className={`text-sm font-extrabold ${isDark ? 'text-emerald-455' : 'text-emerald-600'}`}>
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
          </div>

        </div>
      )}

    </div>
  );
}
