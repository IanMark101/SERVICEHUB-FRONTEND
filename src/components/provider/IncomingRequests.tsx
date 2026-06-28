import React from 'react';
import { useApp } from '../../context/AppContext';
import { Check, X, Calendar, User, MapPin } from 'lucide-react';

export default function IncomingRequests({ currentProviderId = 'u3' }: { currentProviderId?: string }) {
  const { jobEngagements, respondToDirectBooking, isDark } = useApp();


  // Filter pending direct bookings
  const pendingRequests = jobEngagements.filter(
    je => je.providerId === currentProviderId && je.status === 'pending_provider'
  );

  return (
    <div className={`space-y-6 select-none transition-colors duration-200 ${isDark ? 'text-[#f2efe9]' : 'text-slate-800'}`}>
      


      {pendingRequests.length === 0 ? (
        <div className={`rounded-[24px] p-12 border text-center text-sm font-medium transition-colors duration-200 ${
          isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#b4b0a9]' : 'bg-white border-slate-200 text-slate-500'
        }`}>
          No pending direct booking requests at the moment.
        </div>
      ) : (
        <div className="space-y-4">
          {pendingRequests.map((je) => {
            const formattedDate = new Date(je.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <div 
                key={je.id} 
                className={`rounded-[24px] p-6 border shadow-sm space-y-4 transition-colors duration-200 ${
                  isDark ? 'bg-[#22211e] border-neutral-850' : 'bg-white border-slate-200 hover:shadow-md'
                }`}
              >
                
                {/* Header title */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className={`font-extrabold text-sm leading-snug ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                      {je.title} • <span className={`font-semibold text-[11px] ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>10 mins ago</span>
                    </h3>
                    
                    <div className="flex items-center space-x-1.5 mt-1">
                      <User className={`w-3.5 h-3.5 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`} />
                      <span className={`text-xs font-semibold ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
                        From: <span className={isDark ? 'text-[#f2efe9]' : 'text-slate-700'}>{je.seekerName}</span>
                      </span>
                    </div>
                  </div>

                  {/* Budget & Location box on right */}
                  <div className="text-right">
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}`}>Offered Budget</span>
                    <span className={`text-lg font-extrabold ${isDark ? 'text-[#f2efe9]' : 'text-slate-950'}`}>₱{je.price}</span>
                    <span className={`inline-flex items-center text-[9px] font-bold mt-0.5 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-455'}`}>
                      <MapPin className="w-3 h-3 mr-0.5" />
                      Cordova, Cebu
                    </span>
                  </div>
                </div>

                {/* Description details */}
                <div className={`border rounded-2xl p-4 flex items-start space-x-3 transition-colors duration-200 ${
                  isDark ? 'bg-[#1c1b18] border-neutral-850' : 'bg-slate-50 border-slate-100'
                }`}>
                  <p className={`text-xs leading-relaxed italic ${isDark ? 'text-[#f2efe9]' : 'text-slate-600'}`}>
                    "Need prompt assistance for this service listing. Faucet leak is spraying and needs sealing as soon as possible."
                  </p>
                </div>

                {/* Accept/Decline Actions */}
                <div className={`pt-2 border-t flex items-center justify-end space-x-2.5 ${isDark ? 'border-neutral-855' : 'border-slate-100'}`}>
                  <button
                    onClick={() => respondToDirectBooking(je.id, false)}
                    className={`px-5 py-2.5 border font-bold text-xs rounded-xl transition-all ${
                      isDark 
                        ? 'border-neutral-800 hover:bg-red-950/20 hover:text-red-400 hover:border-red-900/30 text-[#b4b0a9]' 
                        : 'border-slate-200 hover:bg-red-50 hover:text-red-650 hover:border-red-200 text-slate-500'
                    }`}
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => respondToDirectBooking(je.id, true)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept Job</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
