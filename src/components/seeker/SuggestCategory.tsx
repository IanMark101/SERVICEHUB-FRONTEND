import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lightbulb, Send, Sparkles } from 'lucide-react';

export default function SuggestCategory() {
  const { categorySuggestions, suggestCategory, isDark } = useApp();
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  // Filter suggestions submitted by Alex Mercer
  const mySuggestions = categorySuggestions.filter(s => s.suggestedBy === 'Alex Mercer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      alert('Please fill out all fields.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      suggestCategory('Alex Mercer', name, description);
      setLoading(false);
      setSuccess(true);
      setName('');
      setDescription('');

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 800);
  };

  const handleClear = () => {
    setName('');
    setDescription('');
  };

  return (
    <div className={`max-w-5xl mx-auto space-y-6 select-none transition-colors duration-200 ${isDark ? 'text-[#f2efe9]' : 'text-slate-800'}`}>

      {/* Top Banner (Matches Seeker Orange branding) */}
      <div className={`rounded-3xl p-6 border flex items-start space-x-4 transition-colors duration-200 ${isDark
          ? 'bg-gradient-to-br from-orange-950/15 to-orange-950/5 border-orange-900/30'
          : 'bg-gradient-to-br from-orange-50 to-orange-100/30 border-orange-100'
        }`}>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100/50 text-orange-600'
          }`}>
          <Lightbulb className={`w-6 h-6 ${isDark ? 'text-orange-400 fill-orange-400/5' : 'text-orange-600 fill-orange-500/10'}`} />
        </div>
        <div className="space-y-1">
          <h2 className={`text-sm font-extrabold ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>Can't find what you need?</h2>
          <p className={`text-[10px] leading-relaxed max-w-md ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
            Help us grow our marketplace! Suggest new categories of work you need done, and we will source local providers matching those specialties.
          </p>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left Column (3/5): Suggestion Form */}
        <div className="lg:col-span-3">
          <div className={`rounded-[24px] p-8 border shadow-sm space-y-6 transition-colors duration-200 ${isDark ? 'bg-[#22211e] border-neutral-800/80' : 'bg-white border-slate-300'
            }`}>

            <div className={`flex items-center space-x-2 border-b pb-4 ${isDark ? 'border-neutral-850' : 'border-slate-100'}`}>
              <Sparkles className={`w-4 h-4 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
              <h3 className={`font-extrabold text-xs uppercase tracking-wider ${isDark ? 'text-[#f2efe9]' : 'text-slate-950'}`}>
                Submit a Category Suggestion
              </h3>
            </div>

            {/* Success alert banner */}
            {success && (
              <div className={`border rounded-2xl p-4 text-xs font-semibold flex items-center space-x-2.5 animate-in fade-in duration-205 ${isDark ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-450' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}>
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">✓</span>
                <span>Your suggestion has been logged. Admins will review and update the marketplace catalog soon!</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Suggestion Name */}
              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                  Suggested Category Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pet Grooming, Mobile Car Wash, AC Repair"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm transition-all focus:ring-4 focus:ring-orange-500/10 ${isDark
                      ? 'bg-[#1c1b18] border-neutral-800/80 text-[#f2efe9] focus:border-orange-500/80'
                      : 'bg-white border-slate-300 text-slate-700 focus:border-orange-500'
                    }`}
                />
              </div>

              {/* Suggestion Description */}
              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                  Why should we add this?
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Describe the typical tasks or services that would fall under this category..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm resize-none transition-all focus:ring-4 focus:ring-orange-500/10 ${isDark
                      ? 'bg-[#1c1b18] border-neutral-800/80 text-[#f2efe9] focus:border-orange-500/80'
                      : 'bg-white border-slate-300 text-slate-700 focus:border-orange-500'
                    }`}
                />
              </div>

              {/* Form Actions */}
              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className={`px-4 py-2 border font-bold text-xs rounded-xl transition-all cursor-pointer ${isDark
                      ? 'border-neutral-800 hover:bg-[#2c2b27] text-[#b4b0a9]'
                      : 'border-slate-300 hover:bg-slate-50 text-slate-500'
                    }`}
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center space-x-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'Submitting...' : 'Submit Suggestion'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>

        {/* Right Column (2/5): Past Suggestions Panel */}
        <div className="lg:col-span-2">
          <div className={`rounded-[24px] p-6 border shadow-sm space-y-4 transition-colors duration-200 h-full ${isDark ? 'bg-[#22211e] border-neutral-800/80' : 'bg-white border-slate-300'
            }`}>
            <h3 className={`font-extrabold text-xs uppercase tracking-wider border-b pb-3 ${isDark ? 'text-[#f2efe9] border-neutral-850' : 'text-slate-900 border-slate-100'
              }`}>
              Your Past Suggestions
            </h3>

            {mySuggestions.length === 0 ? (
              <p className="text-[10px] text-slate-400 py-2">No past suggestions submitted yet.</p>
            ) : (
              <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
                {mySuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className={`border rounded-2xl p-4 flex items-start justify-between gap-4 transition-colors duration-200 ${isDark ? 'bg-[#1c1b18] border-neutral-850' : 'bg-slate-50 border-slate-200'
                      }`}
                  >
                    <div className="space-y-1">
                      <h4 className={`font-extrabold text-xs ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>{suggestion.name}</h4>
                      <p className={`text-[10px] leading-relaxed ${isDark ? 'text-[#b4b0a9]' : 'text-slate-550'}`}>
                        {suggestion.description}
                      </p>
                    </div>

                    {suggestion.status === 'pending' && (
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider flex-shrink-0 ${isDark
                          ? 'text-amber-400 bg-amber-950/20 border-amber-900/30'
                          : 'text-amber-600 bg-amber-50 border-amber-100'
                        }`}>
                        Pending
                      </span>
                    )}
                    {suggestion.status === 'approved' && (
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider flex-shrink-0 ${isDark
                          ? 'text-emerald-450 bg-emerald-950/20 border-emerald-900/30'
                          : 'text-emerald-600 bg-emerald-50 border-emerald-200'
                        }`}>
                        Approved
                      </span>
                    )}
                    {suggestion.status === 'rejected' && (
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider flex-shrink-0 ${isDark
                          ? 'text-red-400 bg-red-950/20 border-red-900/30'
                          : 'text-red-650 bg-red-50 border-red-200'
                        }`}>
                        Declined
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
