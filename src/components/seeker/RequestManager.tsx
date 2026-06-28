import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ClipboardList, Trash2, Edit2, Check, X, MessageSquare } from 'lucide-react';
import { usePagination } from '../../hooks/usePagination';
import PaginationBar from '../PaginationBar';

interface EditModalState {
  requestId: string;
  title: string;
  budget: number;
  description: string;
}

export default function RequestManager({ 
  currentUserId = 'u1',
  onNavigateToOffers, 
  onNavigateToPost 
}: { 
  currentUserId?: string;
  onNavigateToOffers?: () => void;
  onNavigateToPost?: () => void; 
}) {
  const { jobRequests, bids, deleteJobRequest, editJobRequest, isDark } = useApp();
  
  // Find current seeker's requests
  const myRequests = jobRequests.filter(r => r.seekerId === currentUserId);

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedRequests,
    goToPage,
    nextPage,
    prevPage,
    startIndex,
    endIndex
  } = usePagination(myRequests, 8);

  // Edit State
  const [editingRequest, setEditingRequest] = useState<EditModalState | null>(null);
  
  // Local state to toggle accepting state (simulated by modifying list state directly or keeping standard toggles)
  const [pausedRequests, setPausedRequests] = useState<Record<string, boolean>>({});

  const handleToggleAccepting = (requestId: string) => {
    setPausedRequests(prev => ({
      ...prev,
      [requestId]: !prev[requestId]
    }));
  };

  const handleOpenEdit = (req: any) => {
    setEditingRequest({
      requestId: req.id,
      title: req.title,
      budget: req.budget,
      description: req.description
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest) return;
    
    editJobRequest(
      editingRequest.requestId,
      editingRequest.title,
      editingRequest.budget,
      editingRequest.description
    );
    
    setEditingRequest(null);
  };

  return (
    <div className={`space-y-6 select-none transition-colors duration-200 ${isDark ? 'text-[#f2efe9]' : 'text-slate-800'}`}>
      
      {/* Header Action Strip */}
      <div className={`flex items-center justify-end border-b pb-4 ${isDark ? 'border-neutral-800/80' : 'border-slate-200'}`}>
        
        <button
          onClick={onNavigateToPost}
          className="bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 flex items-center space-x-1.5"
        >
          <span>+ New Request</span>
        </button>
      </div>

      {/* Requests Rows */}
      {myRequests.length === 0 ? (
        <div className={`rounded-[24px] p-12 border text-center text-sm font-medium transition-colors duration-200 ${
          isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#b4b0a9]' : 'bg-white border-slate-200 text-slate-500'
        }`}>
          You haven't broadcasted any public task requests yet. Click "+ New Request" to start.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            {paginatedRequests.map((req) => {
              const offerCount = bids.filter(b => b.requestId === req.id && b.status === 'pending').length;
              const isPaused = pausedRequests[req.id] || false;
              
              return (
                <div 
                  key={req.id} 
                  className={`rounded-[24px] p-5 border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-200 ${
                    isDark ? 'bg-[#22211e] border-neutral-855' : 'bg-white border-slate-200 hover:shadow-md'
                  }`}
                >
                  
                  {/* Left side: Icon, title, metadata */}
                  <div className="flex items-start space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-600'
                    }`}>
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`font-extrabold text-xs md:text-sm mb-1 leading-snug ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                        {req.title}
                      </h3>
                      
                      {/* Details row: Price, Location, Category */}
                      <div className={`flex flex-wrap items-center gap-2 text-[10px] font-bold ${isDark ? 'text-[#b4b0a9]' : 'text-slate-450'}`}>
                        <span className={`${isDark ? 'text-[#f2efe9]' : 'text-slate-900'} font-extrabold`}>Est. Budget: ₱{req.budget}</span>
                        <span className="text-slate-300">•</span>
                        <span>Central Cordova, Cebu</span>
                        <span className="text-slate-300">•</span>
                        <span className={`uppercase tracking-wider text-[9px] ${isDark ? 'text-orange-400' : 'text-orange-655'}`}>
                          {req.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right side: Action controls & Toggle */}
                  <div className={`flex flex-wrap items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 ${
                    isDark ? 'border-neutral-850' : 'border-slate-100'
                  }`}>
                    
                    {/* Control Buttons */}
                    <div className="flex items-center space-x-2">
                      {/* Offers count badge */}
                      <button
                        onClick={onNavigateToOffers}
                        className={`inline-flex items-center space-x-1 px-3 py-1.5 border rounded-xl transition-all text-[10px] font-extrabold ${
                          isDark 
                            ? 'bg-orange-950/20 text-orange-450 border-orange-900/30 hover:bg-orange-950/30' 
                            : 'bg-orange-55 text-orange-600 border-orange-100 hover:bg-orange-100'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Offers [{offerCount}]</span>
                      </button>

                      {/* Edit button */}
                      <button
                        onClick={() => handleOpenEdit(req)}
                        className={`px-3 py-1.5 border font-bold text-[10px] rounded-xl transition-all flex items-center space-x-1 ${
                          isDark 
                            ? 'border-neutral-800 hover:bg-[#2c2b27] text-[#b4b0a9]' 
                            : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                        }`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => deleteJobRequest(req.id)}
                        className={`px-3 py-1.5 border font-bold text-[10px] rounded-xl transition-all flex items-center space-x-1 ${
                          isDark 
                            ? 'border-red-950/45 hover:bg-red-950/20 text-red-400' 
                            : 'border-red-200 hover:bg-red-50 text-red-500'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>

                    {/* Toggle accepting switch */}
                    <div className={`flex items-center space-x-2 border-l pl-4 ${isDark ? 'border-neutral-850' : 'border-slate-100'}`}>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-[#b4b0a9]' : 'text-slate-450'}`}>
                        Status:
                      </span>
                      
                      <button
                        type="button"
                        onClick={() => handleToggleAccepting(req.id)}
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
                        {!isPaused ? 'Accepting' : 'Paused'}
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
            totalItems={myRequests.length}
            variant="seeker"
          />
        </div>
      )}

      {/* Edit Form Modal Overlay */}
      {editingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm select-none animate-in fade-in duration-200">
          <div className={`rounded-[24px] max-w-lg w-full overflow-hidden shadow-xl border animate-in zoom-in-95 duration-200 ${
            isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            
            {/* Header */}
            <div className={`p-5 border-b flex justify-between items-center ${
              isDark ? 'border-neutral-855 bg-[#1c1b18]/45' : 'border-slate-100 bg-slate-50/50'
            }`}>
              <h3 className={`font-extrabold text-sm ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                Edit Request details
              </h3>
              <button 
                onClick={() => setEditingRequest(null)}
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
                  Request Title
                </label>
                <input 
                  type="text"
                  required
                  value={editingRequest.title}
                  onChange={(e) => setEditingRequest({ ...editingRequest, title: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm transition-all ${
                    isDark 
                      ? 'bg-[#1c1b18] border-neutral-850 text-[#f2efe9] focus:border-orange-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-orange-500'
                  }`}
                />
              </div>
 
              {/* Budget */}
              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                  Estimated Budget (₱)
                </label>
                <input 
                  type="number"
                  required
                  min={1}
                  value={editingRequest.budget}
                  onChange={(e) => setEditingRequest({ ...editingRequest, budget: Number(e.target.value) })}
                  className={`w-full px-4 py-3 rounded-xl border outline-none font-semibold text-sm transition-all ${
                    isDark 
                      ? 'bg-[#1c1b18] border-neutral-855 text-[#f2efe9] focus:border-orange-500/80' 
                      : 'bg-slate-50 border-slate-200 text-slate-750 focus:border-orange-500'
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
                  value={editingRequest.description}
                  onChange={(e) => setEditingRequest({ ...editingRequest, description: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm resize-none transition-all ${
                    isDark 
                      ? 'bg-[#1c1b18] border-neutral-855 text-[#f2efe9] focus:border-orange-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-orange-500'
                  }`}
                />
              </div>

              {/* Actions */}
              <div className={`pt-3 border-t flex items-center justify-end space-x-2.5 ${isDark ? 'border-neutral-850' : 'border-slate-100'}`}>
                <button
                  type="button"
                  onClick={() => setEditingRequest(null)}
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
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95"
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
