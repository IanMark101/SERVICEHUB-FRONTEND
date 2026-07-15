import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Wrench, Edit3, Trash2, Plus, X, Sparkles } from 'lucide-react';
import { usePagination } from '../../hooks/usePagination';
import PaginationBar from '../PaginationBar';
import { apiGetProviderSummary } from '../../api/ai.api';

interface EditServiceState {
  serviceId: string;
  title: string;
  price: number;
  description: string;
}

export default function ServiceManager({
  currentProviderId = 'u3',
  onNavigateToOffer
}: {
  currentProviderId?: string;
  onNavigateToOffer?: () => void;
}) {
  const { services, editServiceListing, toggleServiceListingStatus, isDark } = useApp();

  // State for per-service AI Review Summary
  const [expandedAiServiceId, setExpandedAiServiceId] = useState<string | null>(null);
  const [aiSummaries, setAiSummaries] = useState<Record<string, { summary: string | null; reason?: string }>>({});
  const [loadingAiMap, setLoadingAiMap] = useState<Record<string, boolean>>({});

  // Find current provider's services
  const myServices = services.filter(s => s.providerId === currentProviderId);

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedServices,
    goToPage,
    nextPage,
    prevPage,
    startIndex,
    endIndex
  } = usePagination(myServices, 6);

  const [editingService, setEditingService] = useState<EditServiceState | null>(null);

  // Trigger per-service AI Review Summary fetch from backend
  const handleToggleAiSummary = (serviceId: string) => {
    if (expandedAiServiceId === serviceId) {
      setExpandedAiServiceId(null);
      return;
    }

    setExpandedAiServiceId(serviceId);

    // If summary for this specific service is already fetched, no need to fetch again
    if (aiSummaries[serviceId] !== undefined) return;

    setLoadingAiMap(prev => ({ ...prev, [serviceId]: true }));
    apiGetProviderSummary(currentProviderId, serviceId)
      .then((res: any) => {
        if (res.success && res.data) {
          setAiSummaries(prev => ({
            ...prev,
            [serviceId]: {
              summary: res.data.summary,
              reason: res.data.reason,
            },
          }));
        }
      })
      .catch(() => {
        setAiSummaries(prev => ({
          ...prev,
          [serviceId]: {
            summary: null,
            reason: 'Unable to connect to AI summary service at this time.',
          },
        }));
      })
      .finally(() => {
        setLoadingAiMap(prev => ({ ...prev, [serviceId]: false }));
      });
  };

  const handleOpenEdit = (s: any) => {
    setEditingService({
      serviceId: s.id,
      title: s.title,
      price: s.price,
      description: s.description
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    editServiceListing(
      editingService.serviceId,
      editingService.title,
      editingService.price,
      editingService.description
    );
    setEditingService(null);
  };

  return (
    <div className={`space-y-6 select-none transition-colors duration-200 ${isDark ? 'text-[#f2efe9]' : 'text-slate-800'}`}>

      {/* Header Action Strip */}
      <div className={`flex items-center justify-end border-b pb-4 ${isDark ? 'border-neutral-800/80' : 'border-slate-200'}`}>
        <button
          onClick={onNavigateToOffer}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 flex items-center space-x-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Listing</span>
        </button>
      </div>

      {/* Services List */}
      {myServices.length === 0 ? (
        <div className={`rounded-[24px] p-12 border text-center text-sm font-medium transition-colors duration-200 ${isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#b4b0a9]' : 'bg-white border-slate-200 text-slate-500'
          }`}>
          You don't have any active service listings yet. Click "New Listing" to offer a service.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            {paginatedServices.map((service) => {
              const isPaused = service.isPaused;
              const isAiExpanded = expandedAiServiceId === service.id;
              const isLoadingAi = loadingAiMap[service.id];
              const aiData = aiSummaries[service.id];

              return (
                <div key={service.id} className="space-y-3">
                  
                  {/* 🤖 Per-Service AI Review Summary Expansion Card */}
                  {isAiExpanded && (
                    <div className={`p-5 rounded-[24px] border shadow-sm transition-all duration-200 animate-in fade-in zoom-in-95 ${isDark
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-[#f2efe9]'
                        : 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                      }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                          <h4 className="text-xs uppercase tracking-wider font-extrabold text-emerald-500">
                            AI-Generated Review Summary — {service.title}
                          </h4>
                        </div>
                        <button
                          onClick={() => setExpandedAiServiceId(null)}
                          className="text-slate-400 hover:text-slate-200 text-xs font-bold px-2 py-0.5 rounded-lg border border-transparent hover:border-slate-700"
                        >
                          ✕
                        </button>
                      </div>

                      {isLoadingAi ? (
                        <div className="flex items-center space-x-2 py-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-100" />
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-200" />
                          <span className="text-[10px] text-slate-400 font-semibold pl-1">Connecting to AI backend and analyzing client reviews for {service.title}...</span>
                        </div>
                      ) : aiData?.summary ? (
                        <p className={`text-xs leading-relaxed font-semibold italic ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                          &ldquo;{aiData.summary}&rdquo;
                        </p>
                      ) : (
                        <div className="space-y-0.5">
                          <div className="font-bold text-amber-500 text-xs">AI Summary unavailable</div>
                          <p className={`text-[11px] font-medium leading-relaxed ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                            {aiData?.reason || 'This provider needs at least 5 reviews for us to generate a reliable AI review summary.'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Service Listing Card Item */}
                  <div
                    className={`rounded-[24px] p-5 border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-200 ${isDark ? 'bg-[#22211e] border-neutral-850' : 'bg-white border-slate-200 hover:shadow-md'
                      }`}
                  >
                    {/* Left: Icon, Title, and details */}
                    <div className="flex items-start space-x-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                        <Wrench className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className={`font-extrabold text-xs md:text-sm mb-1 leading-snug ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                          {service.title}
                        </h3>

                        {/* Tags row */}
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
                          <span className={isDark ? 'text-[#f2efe9]' : 'text-slate-900'}>₱{service.price} Base</span>
                          <span className="text-slate-350">•</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] ${isDark ? 'bg-[#1c1b18] text-[#b4b0a9]' : 'bg-slate-50 text-slate-600'
                            }`}>
                            On-site Cash
                          </span>
                          {service.category === 'Electrical Repair' && (
                            <span className={`px-2 py-0.5 rounded text-[8px] ${isDark ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/30' : 'bg-emerald-50 text-emerald-600'
                              }`}>
                              GCash
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Controls & Toggle Switch */}
                    <div className={`flex flex-wrap items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-3 md:pt-0 ${isDark ? 'border-neutral-855' : 'border-slate-100'
                      }`}>
                      <div className="flex items-center space-x-2">
                        {/* ✨ Real Backend Per-Service AI Summary Toggle Button */}
                        <button
                          onClick={() => handleToggleAiSummary(service.id)}
                          className={`px-3 py-1.5 border font-bold text-[10px] rounded-xl transition-all flex items-center space-x-1.5 active:scale-95 ${isAiExpanded
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                              : isDark
                              ? 'border-neutral-800 hover:bg-[#2c2b27] text-[#b4b0a9]'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                            }`}
                          title="View live AI-generated review summary for this specific service"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                          <span>AI Summary</span>
                        </button>

                        <button
                          onClick={() => handleOpenEdit(service)}
                          className={`px-3 py-1.5 border font-bold text-[10px] rounded-xl transition-all flex items-center space-x-1 ${isDark
                              ? 'border-neutral-800 hover:bg-[#2c2b27] text-[#b4b0a9]'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700'
                            }`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          disabled
                          className={`px-3 py-1.5 border font-bold text-[10px] rounded-xl transition-all flex items-center space-x-1 cursor-not-allowed ${isDark
                              ? 'border-neutral-850 text-neutral-600'
                              : 'border-slate-200 text-slate-300'
                            }`}
                          title="Deletions managed in future dashboard checkouts"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>

                      {/* Toggle Status switch */}
                      <div className={`flex items-center space-x-2 border-l pl-3 ${isDark ? 'border-neutral-850' : 'border-slate-100'}`}>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}`}>
                          Status:
                        </span>

                        <button
                          type="button"
                          onClick={() => toggleServiceListingStatus(service.id)}
                          className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-in-out focus:outline-none ${!isPaused ? 'bg-emerald-500' : isDark ? 'bg-neutral-800' : 'bg-slate-300'
                            }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-250 ease-in-out ${!isPaused ? 'translate-x-4' : 'translate-x-0'
                              }`}
                          />
                        </button>

                        <span className={`text-[10px] font-bold ${!isPaused ? 'text-emerald-600' : isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
                          {!isPaused ? 'Active' : 'Paused'}
                        </span>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            goToPage={goToPage}
            nextPage={nextPage}
            prevPage={prevPage}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={myServices.length}
            variant="provider"
          />
        </div>
      )}

      {/* Edit Listing dialog */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/70 backdrop-blur-sm select-none animate-in fade-in duration-200">
          <div className={`rounded-[24px] max-w-lg w-full overflow-hidden shadow-xl border animate-in zoom-in-95 duration-200 ${isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'
            }`}>

            <div className={`p-5 border-b flex justify-between items-center ${isDark ? 'border-neutral-855 bg-[#1c1b18]/45' : 'border-slate-100 bg-slate-50/50'
              }`}>
              <h3 className={`font-extrabold text-sm ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                Edit Listing Rates
              </h3>
              <button
                onClick={() => setEditingService(null)}
                className={`p-1.5 rounded-lg border transition-colors ${isDark ? 'border-neutral-800 hover:bg-slate-800 text-neutral-450' : 'border-slate-200 hover:bg-slate-100 text-slate-400'
                  }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              {/* Title */}
              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                  Listing Title
                </label>
                <input
                  type="text"
                  required
                  value={editingService.title}
                  onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm transition-all ${isDark
                      ? 'bg-[#1c1b18] border-neutral-850 text-[#f2efe9] focus:border-emerald-500'
                      : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-emerald-500'
                    }`}
                />
              </div>

              {/* Price */}
              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                  Base Price (₱)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={editingService.price}
                  onChange={(e) => setEditingService({ ...editingService, price: Number(e.target.value) })}
                  className={`w-full px-4 py-3 rounded-xl border outline-none font-semibold text-sm transition-all ${isDark
                      ? 'bg-[#1c1b18] border-neutral-850 text-[#f2efe9] focus:border-emerald-500'
                      : 'bg-slate-50 border-slate-200 text-slate-755 focus:border-emerald-500'
                    }`}
                />
              </div>

              {/* Description */}
              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                  Description
                </label>
                <textarea
                  rows={4}
                  required
                  value={editingService.description}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm resize-none transition-all ${isDark
                      ? 'bg-[#1c1b18] border-neutral-850 text-[#f2efe9] focus:border-emerald-500'
                      : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-emerald-500'
                    }`}
                />
              </div>

              {/* Actions */}
              <div className={`pt-3 border-t flex items-center justify-end space-x-2.5 ${isDark ? 'border-neutral-850' : 'border-slate-100'}`}>
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className={`px-4 py-2.5 border font-bold text-xs rounded-xl transition-all ${isDark
                      ? 'border-neutral-800 hover:bg-[#2c2b27] text-[#b4b0a9]'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                    }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
