import React, { useState, FormEvent } from 'react';
import { useApp } from '../../context/AppContext';
import { PlusCircle, Info } from 'lucide-react';

export default function PostRequest() {
  const { postJobRequest, isDark } = useApp();
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('Plumbing');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [budget, setBudget] = useState<number>(500);
  const [description, setDescription] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const categories = [
    { label: 'Plumbing Repair', value: 'Plumbing' },
    { label: 'House Cleaning', value: 'House Cleaning' },
    { label: 'Electrical Repair', value: 'Electrical Repair' },
    { label: 'Gardening & Lawn Care', value: 'Lawn Care' },
    { label: 'Academic Tutoring', value: 'Tutoring' }
  ];

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Please fill out all fields.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const seekerId = 'u1'; // Default logged-in seeker Alex
      postJobRequest(seekerId, title, category, urgency, budget, description);

      setLoading(false);
      setSuccess(true);
      setTitle('');
      setDescription('');
      setBudget(500);
      setCategory('Plumbing');
      setUrgency('medium');

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 800);
  };

  return (
    <div className={`max-w-5xl mx-auto space-y-6 select-none transition-colors duration-200 ${isDark ? 'text-[#f2efe9]' : 'text-slate-800'}`}>

      {/* Form Container Card */}
      <div className={`rounded-[24px] p-8 border shadow-sm transition-colors duration-200 ${isDark ? 'bg-[#22211e] border-neutral-800/80' : 'bg-white border-slate-300'
        }`}>

        {/* Header */}
        <div className={`flex items-center space-x-3 mb-6 pb-4 border-b ${isDark ? 'border-neutral-850' : 'border-slate-100'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-600'
            }`}>
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-base font-extrabold leading-none ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
              Post a Request
            </h2>
            <p className={`text-[10px] mt-1 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-450'}`}>
              Broadcast your task requirements to all local verified providers.
            </p>
          </div>
        </div>

        {/* Success Alert Banner */}
        {success && (
          <div className={`border rounded-2xl p-4 text-xs font-semibold flex items-center space-x-2.5 mb-6 animate-in fade-in duration-205 ${isDark ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">✓</span>
            <span>Your request has been broadcasted publicly. Providers can now submit bids!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left Column (3/5 width): Main Content fields */}
          <div className="lg:col-span-3 space-y-5">
            {/* Title */}
            <div>
              <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                Request Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Need help fixing kitchen faucet leak"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm transition-all focus:ring-4 focus:ring-orange-500/10 ${isDark
                    ? 'bg-[#1c1b18] border-neutral-800/80 text-[#f2efe9] focus:border-orange-500/80'
                    : 'bg-white border-slate-300 text-slate-700 focus:border-orange-500'
                  }`}
              />
            </div>

            {/* Detailed Description */}
            <div>
              <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                Detailed Description
              </label>
              <textarea
                rows={7}
                required
                placeholder="Describe the scope of work, timeline, and tools required so providers can submit accurate proposals."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm resize-none leading-relaxed transition-all focus:ring-4 focus:ring-orange-500/10 ${isDark
                    ? 'bg-[#1c1b18] border-neutral-800/80 text-[#f2efe9] focus:border-orange-500'
                    : 'bg-white border-slate-300 text-slate-700 focus:border-orange-500'
                  }`}
              />
            </div>
          </div>

          {/* Right Column (2/5 width): Configuration & Summary notes */}
          <div className="lg:col-span-2 space-y-5 flex flex-col justify-between">
            <div className="space-y-5">
              {/* Category */}
              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                  Service Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm transition-all focus:ring-4 focus:ring-orange-500/10 ${isDark
                      ? 'bg-[#1c1b18] border-neutral-800/80 text-[#f2efe9] focus:border-orange-500/80'
                      : 'bg-white border-slate-300 text-slate-700 focus:border-orange-500'
                    }`}
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value} className={isDark ? 'bg-[#1c1b18] text-[#f2efe9]' : ''}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Urgency */}
              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                  Urgency Level
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as any)}
                  className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm transition-all focus:ring-4 focus:ring-orange-500/10 ${isDark
                      ? 'bg-[#1c1b18] border-neutral-800/80 text-[#f2efe9] focus:border-orange-500/80'
                      : 'bg-white border-slate-300 text-slate-700 focus:border-orange-500'
                    }`}
                >
                  <option value="low" className={isDark ? 'bg-[#1c1b18] text-[#f2efe9]' : ''}>Low Urgency (Within a week)</option>
                  <option value="medium" className={isDark ? 'bg-[#1c1b18] text-[#f2efe9]' : ''}>Medium Urgency (Next 1-2 days)</option>
                  <option value="high" className={isDark ? 'bg-[#1c1b18] text-[#f2efe9]' : ''}>High Urgency (Emergency / Today)</option>
                </select>
              </div>

              {/* Budget */}
              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                  Estimated Budget (₱)
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  placeholder="e.g. 500"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className={`w-full px-4 py-3 rounded-xl border outline-none font-semibold text-sm transition-all focus:ring-4 focus:ring-orange-500/10 ${isDark
                      ? 'bg-[#1c1b18] border-neutral-800/80 text-[#f2efe9] focus:border-orange-500/80'
                      : 'bg-white border-slate-300 text-slate-700 focus:border-orange-500'
                    }`}
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-3 flex items-center justify-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center space-x-2"
              >
                {loading ? 'Posting...' : 'Post Request Publicly'}
              </button>
            </div>
          </div>

        </form>

      </div>

      {/* Form Note Box */}
      <div className={`rounded-2xl p-4 border flex items-start space-x-3 transition-colors duration-200 ${isDark ? 'bg-[#1c1b18] border-neutral-800/80 text-[#b4b0a9]' : 'bg-slate-50 border-slate-300 text-slate-500'
        }`}>
        <Info className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
        <p className="text-[10px] leading-relaxed">
          Posting a public request allows multiple service providers to offer competitive bids on your work. You can review profiles, track incoming bids side-by-side, and choose the provider that best matches your budget and requirements.
        </p>
      </div>

    </div>
  );
}
