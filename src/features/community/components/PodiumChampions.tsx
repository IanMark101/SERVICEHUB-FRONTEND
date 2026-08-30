import React from 'react';
import { Crown, Star } from 'lucide-react';
import { TopProvider } from '../types/community.types';

interface PodiumChampionsProps {
  firstPlace?: TopProvider;
  secondPlace?: TopProvider;
  thirdPlace?: TopProvider;
  currentUserId?: string;
  isDark?: boolean;
  onSelect: (id: string) => void;
}

export default function PodiumChampions({
  firstPlace,
  secondPlace,
  thirdPlace,
  currentUserId,
  isDark = false,
  onSelect,
}: PodiumChampionsProps) {
  return (
    <div className="pt-4 pb-8 border-b dark:border-neutral-800/80 border-slate-100 relative">
      <div className="flex flex-col sm:flex-row items-end justify-center gap-4 sm:gap-6 lg:gap-10 max-w-2xl mx-auto">

        {/* ── 2nd Place (Left) ── */}
        {secondPlace && (
          <div
            onClick={() => onSelect(secondPlace.id)}
            className="w-full sm:w-44 flex flex-col items-center text-center cursor-pointer group/rank2 order-2 sm:order-1 transition-transform hover:scale-[1.03]"
            title={`Rank #2: ${secondPlace.name}`}
          >
            <div className="relative mb-2.5">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full ring-3 ring-blue-400/80 p-0.5 shadow-md bg-neutral-800 flex items-center justify-center overflow-hidden">
                {secondPlace.avatarUrl ? (
                  <img
                    src={secondPlace.avatarUrl}
                    alt={secondPlace.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-700 text-white font-black text-lg flex items-center justify-center">
                    {secondPlace.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 text-white font-black text-[11px] flex items-center justify-center shadow border-2 border-white dark:border-[#22211e]">
                2
              </div>
            </div>

            <div className="mt-2 space-y-0.5 w-full px-1">
              <div className="flex items-center justify-center space-x-1">
                <h4 className="font-extrabold text-xs sm:text-sm truncate group-hover/rank2:text-blue-400 transition-colors">
                  {secondPlace.name}
                </h4>
                {secondPlace.id === currentUserId && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full font-black bg-blue-500 text-white">
                    You
                  </span>
                )}
              </div>
              <p className={`text-[10px] font-medium truncate ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
                {secondPlace.primaryService || 'Cordova Resident'}
              </p>
              <p className="text-xs font-black text-blue-500 pt-0.5">
                {secondPlace.trustScore}% Trust
              </p>
              <div className="flex items-center justify-center space-x-2 text-[10px] pt-1">
                <span className="flex items-center text-amber-500 font-bold">
                  <Star className="w-3 h-3 mr-0.5 fill-amber-500 text-amber-500" />
                  {secondPlace.avgRating ? secondPlace.avgRating.toFixed(1) : '—'}
                </span>
                <span className={isDark ? 'text-neutral-500' : 'text-slate-400'}>•</span>
                <span className={`font-semibold ${isDark ? 'text-[#b4b0a9]' : 'text-slate-600'}`}>
                  {secondPlace.completedJobs} jobs
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── 1st Place (Center Champion Elevated) ── */}
        {firstPlace && (
          <div
            onClick={() => onSelect(firstPlace.id)}
            className="w-full sm:w-52 flex flex-col items-center text-center cursor-pointer group/rank1 order-1 sm:order-2 transition-transform hover:scale-[1.04]"
            title={`Rank #1 Champion: ${firstPlace.name}`}
          >
            <div className="relative mb-3 flex flex-col items-center">
              <div className="animate-pulse mb-1">
                <Crown className="w-8 h-8 text-amber-400 fill-amber-400 drop-shadow-md" />
              </div>

              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full ring-4 ring-amber-400 p-0.5 shadow-xl shadow-amber-500/20 bg-neutral-800 flex items-center justify-center overflow-hidden">
                {firstPlace.avatarUrl ? (
                  <img
                    src={firstPlace.avatarUrl}
                    alt={firstPlace.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-amber-600 text-white font-black text-xl flex items-center justify-center">
                    {firstPlace.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border-2 border-white dark:border-[#22211e]">
                1
              </div>
            </div>

            <div className="mt-2 space-y-0.5 w-full px-1">
              <div className="flex items-center justify-center space-x-1">
                <h3 className="font-extrabold text-sm sm:text-base truncate group-hover/rank1:text-amber-400 transition-colors">
                  {firstPlace.name}
                </h3>
                {firstPlace.id === currentUserId && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full font-black bg-amber-500 text-slate-950">
                    You
                  </span>
                )}
              </div>
              <p className={`text-[11px] font-semibold truncate ${isDark ? 'text-[#b4b0a9]' : 'text-slate-600'}`}>
                {firstPlace.primaryService || 'Top Service Provider'}
              </p>
              <p className="text-sm font-black text-amber-500 pt-0.5">
                {firstPlace.trustScore}% Trust
              </p>
              <div className="flex items-center justify-center space-x-2 text-[10.5px] pt-1">
                <span className="flex items-center text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 mr-0.5 fill-amber-500 text-amber-500" />
                  {firstPlace.avgRating ? firstPlace.avgRating.toFixed(1) : '5.0'}
                </span>
                <span className={isDark ? 'text-neutral-500' : 'text-slate-400'}>•</span>
                <span className={`font-semibold ${isDark ? 'text-[#b4b0a9]' : 'text-slate-600'}`}>
                  {firstPlace.completedJobs} jobs completed
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── 3rd Place (Right) ── */}
        {thirdPlace && (
          <div
            onClick={() => onSelect(thirdPlace.id)}
            className="w-full sm:w-44 flex flex-col items-center text-center cursor-pointer group/rank3 order-3 sm:order-3 transition-transform hover:scale-[1.03]"
            title={`Rank #3: ${thirdPlace.name}`}
          >
            <div className="relative mb-2.5">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full ring-3 ring-emerald-500/80 p-0.5 shadow-md bg-neutral-800 flex items-center justify-center overflow-hidden">
                {thirdPlace.avatarUrl ? (
                  <img
                    src={thirdPlace.avatarUrl}
                    alt={thirdPlace.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-emerald-800 text-white font-black text-lg flex items-center justify-center">
                    {thirdPlace.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-black text-[11px] flex items-center justify-center shadow border-2 border-white dark:border-[#22211e]">
                3
              </div>
            </div>

            <div className="mt-2 space-y-0.5 w-full px-1">
              <div className="flex items-center justify-center space-x-1">
                <h4 className="font-extrabold text-xs sm:text-sm truncate group-hover/rank3:text-emerald-400 transition-colors">
                  {thirdPlace.name}
                </h4>
                {thirdPlace.id === currentUserId && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full font-black bg-emerald-500 text-white">
                    You
                  </span>
                )}
              </div>
              <p className={`text-[10px] font-medium truncate ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
                {thirdPlace.primaryService || 'Cordova Resident'}
              </p>
              <p className="text-xs font-black text-emerald-500 pt-0.5">
                {thirdPlace.trustScore}% Trust
              </p>
              <div className="flex items-center justify-center space-x-2 text-[10px] pt-1">
                <span className="flex items-center text-amber-500 font-bold">
                  <Star className="w-3 h-3 mr-0.5 fill-amber-500 text-amber-500" />
                  {thirdPlace.avgRating ? thirdPlace.avgRating.toFixed(1) : '—'}
                </span>
                <span className={isDark ? 'text-neutral-500' : 'text-slate-400'}>•</span>
                <span className={`font-semibold ${isDark ? 'text-[#b4b0a9]' : 'text-slate-600'}`}>
                  {thirdPlace.completedJobs} jobs
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
