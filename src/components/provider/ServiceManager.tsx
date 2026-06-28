import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Wrench, Edit3, Trash2, Plus, X } from 'lucide-react';
import { usePagination } from '../../hooks/usePagination';
import PaginationBar from '../PaginationBar';

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

      {/* Services grid */}
      {myServices.length === 0 ? (
        <div className={`rounded-[24px] p-12 border text-center text-sm font-medium transition-colors duration-200 ${
          isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#b4b0a9]' : 'bg-white border-slate-200 text-slate-500'
        }`}>
          You don't have any active service listings yet. Click "New Listing" to offer a service.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            {paginatedServices.map((service) => {
              const isPaused = service.isPaused;

              return (
                <div 
                  key={service.id} 
                  className={`rounded-[24px] p-5 border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-200 ${
                    isDark ? 'bg-[#22211e] border-neutral-850' : 'bg-white border-slate-200 hover:shadow-md'
                  }`}
                >
                  {/* Left: Icon, Title, and details */}
                  <div className="flex items-start space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
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
                        <span className={`px-2 py-0.5 rounded text-[8px] ${
                          isDark ? 'bg-[#1c1b18] text-[#b4b0a9]' : 'bg-slate-50 text-slate-600'
                        }`}>
                          On-site Cash
                        </span>
                        {service.category === 'Electrical Repair' && (
                          <span className={`px-2 py-0.5 rounded text-[8px] ${
                            isDark ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/30' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            GCash
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Controls & Toggle Switch */}
                  <div className={`flex flex-wrap items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 ${
                    isDark ? 'border-neutral-855' : 'border-slate-100'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenEdit(service)}
                        className={`px-3 py-1.5 border font-bold text-[10px] rounded-xl transition-all flex items-center space-x-1 ${
                          isDark 
                            ? 'border-neutral-800 hover:bg-[#2c2b27] text-[#b4b0a9]' 
                            : 'border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        disabled
                        className={`px-3 py-1.5 border font-bold text-[10px] rounded-xl transition-all flex items-center space-x-1 cursor-not-allowed ${
                          isDark 
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
                    <div className={`flex items-center space-x-2 border-l pl-4 ${isDark ? 'border-neutral-850' : 'border-slate-100'}`}>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}`}>
                        Status:
                      </span>
                      
                      <button
                        type="button"
                        onClick={() => toggleServiceListingStatus(service.id)}
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-in-out focus:outline-none ${
                          !isPaused ? 'bg-emerald-500' : isDark ? 'bg-neutral-800' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-250 ease-in-out ${
                            !isPaused ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      
                      <span className={`text-[10px] font-bold ${!isPaused ? 'text-emerald-600' : isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
                        {!isPaused ? 'Active' : 'Paused'}
                      </span>
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
          <div className={`rounded-[24px] max-w-lg w-full overflow-hidden shadow-xl border animate-in zoom-in-95 duration-200 ${
            isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            
            <div className={`p-5 border-b flex justify-between items-center ${
              isDark ? 'border-neutral-855 bg-[#1c1b18]/45' : 'border-slate-100 bg-slate-50/50'
            }`}>
              <h3 className={`font-extrabold text-sm ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                Edit Listing Rates
              </h3>
              <button 
                onClick={() => setEditingService(null)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isDark ? 'border-neutral-800 hover:bg-slate-800 text-neutral-450' : 'border-slate-200 hover:bg-slate-100 text-slate-400'
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
                  className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm transition-all ${
                    isDark 
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
                  className={`w-full px-4 py-3 rounded-xl border outline-none font-semibold text-sm transition-all ${
                    isDark 
                      ? 'bg-[#1c1b18] border-neutral-850 text-[#f2efe9] focus:border-emerald-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-750 focus:border-emerald-500'
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
                  className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm resize-none transition-all ${
                    isDark 
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
                  className={`px-4 py-2.5 border font-bold text-xs rounded-xl transition-all ${
                    isDark 
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
