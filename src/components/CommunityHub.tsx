import React from 'react';
import { Globe, AlertTriangle, Calendar, Star, ShieldCheck, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CommunityHub() {
  const { isDark } = useApp();

  const announcements = [
    {
      id: 'ann1',
      title: 'Scheduled Maintenance',
      desc: 'The platform will undergo brief maintenance on Sunday at 2 AM. Please complete all active chats and transactions prior.',
      date: 'OCT 14, 2023',
      color: isDark 
        ? 'bg-amber-950/20 text-amber-400 border-amber-900/30' 
        : 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      id: 'ann2',
      title: 'New Categories Live!',
      desc: 'Photography and Pet Grooming have been officially added to the marketplace based on community votes.',
      date: 'OCT 15, 2023',
      color: isDark 
        ? 'bg-orange-950/20 text-orange-400 border-orange-900/30' 
        : 'bg-orange-50 text-orange-600 border-orange-100',
    }
  ];

  const providers = [
    { rank: 1, name: 'Peter Parker', rating: 5.0, trust: '100%', jobs: 12 },
    { rank: 2, name: 'Sarah Jenkins', rating: 4.9, trust: '99%', jobs: 89 },
    { rank: 3, name: 'Alex Color', rating: 4.9, trust: '98%', jobs: 67 },
    { rank: 4, name: 'Juan Dela Cruz', rating: 4.8, trust: '96%', jobs: 124 }
  ];

  return (
    <div className={`space-y-6 select-none transition-colors duration-200 ${isDark ? 'text-[#f2efe9]' : 'text-slate-800'}`}>
      
      {/* Header and Banner */}
      <div className={`rounded-[24px] p-6 border flex items-start space-x-5 relative overflow-hidden transition-colors duration-200 ${
        isDark 
          ? 'bg-[#22211e] border-neutral-800/80' 
          : 'bg-gradient-to-br from-slate-50 to-slate-100/50 border-slate-200'
      }`}>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border transition-colors ${
          isDark 
            ? 'bg-[#191919] border-neutral-800/80 text-[#f2efe9]' 
            : 'bg-white border-slate-200 text-slate-700'
        }`}>
          <Globe className="w-7 h-7" />
        </div>
        <div className="space-y-1.5 max-w-xl">
          <h2 className={`text-xl font-extrabold leading-none transition-colors ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>Community Hub</h2>
          <p className={`text-xs leading-relaxed transition-colors ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
            Stay updated with platform announcements, learn how to maximize your experience, and see our top-rated local providers.
          </p>
        </div>
        
        {/* Decorative background world wireframe */}
        <div className="absolute top-1/2 -translate-y-1/2 right-12 opacity-[0.03] pointer-events-none hidden md:block">
          <Globe className="w-40 h-40" />
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Announcements (Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className={`rounded-[24px] p-6 border shadow-sm space-y-4 transition-colors duration-200 ${
            isDark ? 'bg-[#22211e] border-neutral-800/80' : 'bg-white border-slate-200'
          }`}>
            <h3 className={`font-extrabold text-xs uppercase tracking-wider border-b pb-3 flex items-center space-x-2 ${
              isDark ? 'text-[#f2efe9] border-neutral-800/80' : 'text-slate-900 border-slate-100'
            }`}>
              <span className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
              <span>Latest Announcements</span>
            </h3>

            <div className="space-y-4">
              {announcements.map((ann) => (
                <div 
                  key={ann.id} 
                  className={`border rounded-2xl p-5 space-y-2.5 transition-colors duration-200 ${ann.color}`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-xs uppercase tracking-wide leading-none">{ann.title}</h4>
                    <span className="text-[9px] font-bold opacity-70 flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      {ann.date}
                    </span>
                  </div>
                  <p className="text-xs font-semibold leading-relaxed opacity-95">
                    {ann.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Top Weekly Providers Leaderboard */}
        <div className="space-y-4">
          <div className={`rounded-[24px] p-6 border shadow-sm space-y-4 h-full transition-colors duration-200 ${
            isDark ? 'bg-[#22211e] border-neutral-800/80' : 'bg-white border-slate-200'
          }`}>
            <h3 className={`font-extrabold text-xs uppercase tracking-wider border-b pb-3 flex items-center space-x-2 ${
              isDark ? 'text-[#f2efe9] border-neutral-800/80' : 'text-slate-900 border-slate-100'
            }`}>
              <Award className="w-4 h-4 text-amber-500" />
              <span>Top 10 Weekly</span>
            </h3>
            
            <p className={`text-[10px] font-bold leading-snug transition-colors ${
              isDark ? 'text-[#b4b0a9]' : 'text-slate-500'
            }`}>
              Most trusted providers based on completed services and ratings.
            </p>

            <div className="space-y-3.5 pt-2">
              {providers.map((prov) => (
                <div 
                  key={prov.rank} 
                  className={`flex items-center justify-between border rounded-2xl p-3 transition-colors duration-200 ${
                    isDark 
                      ? 'bg-[#191919] border-neutral-800/80' 
                      : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {/* Rank Badge */}
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center font-extrabold text-[9px] border transition-colors ${
                      prov.rank === 1 
                        ? (isDark ? 'bg-amber-950/40 text-amber-400 border-amber-900/30' : 'bg-amber-100 text-amber-700 border-amber-250') :
                      prov.rank === 2 
                        ? (isDark ? 'bg-neutral-800 text-[#f2efe9] border-neutral-700' : 'bg-slate-200 text-slate-700 border-slate-250') :
                      prov.rank === 3 
                        ? (isDark ? 'bg-amber-950/20 text-amber-450 border-amber-900/10' : 'bg-amber-50 text-amber-700 border-amber-100') 
                        : (isDark ? 'bg-[#1c1b18] text-[#b4b0a9] border-neutral-850' : 'bg-slate-50 text-slate-400 border-slate-100')
                    }`}>
                      {prov.rank}
                    </div>

                    <div>
                      <h4 className={`font-extrabold text-xs transition-colors ${
                        isDark ? 'text-[#f2efe9]' : 'text-slate-900'
                      }`}>{prov.name}</h4>
                      
                      <div className="flex items-center space-x-2 mt-0.5 text-[8px] font-bold uppercase tracking-wider">
                        <span className={`px-1 rounded border transition-colors ${
                          isDark 
                            ? 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30' 
                            : 'text-emerald-600 bg-emerald-50 border-emerald-100'
                        }`}>
                          Trust: {prov.trust}
                        </span>
                        <span className={isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}>
                          {prov.jobs} jobs
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center text-xs font-bold text-amber-500">
                    <Star className="w-3.5 h-3.5 mr-0.5 fill-amber-500 text-amber-500" />
                    <span>{prov.rating.toFixed(1)}</span>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
