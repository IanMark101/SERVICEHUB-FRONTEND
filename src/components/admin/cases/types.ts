export interface CaseFilters {
  view: 'active' | 'history' | 'all'; concern?: string; type?: string; status?: string;
  payment?: string; search?: string; sort: 'attention' | 'oldest' | 'newest';
}
export interface CaseParty { id: string; name: string; trustScore: number; verificationStatus: string; moderationStatus: string }
export interface ModerationCase {
  id: string; source: 'report' | 'completion'; type: string; concern: string; status: string;
  explanation: string; createdAt: string; resolvedAt?: string | null; submittedByRole: string;
  reporter: CaseParty; reportedUser?: CaseParty | null;
  booking: { id: string; title: string; amount: number; status: string; started?: boolean; statusBeforeDispute?: string | null;
    paymentStatus: string; paymentMethod: string; seeker: CaseParty; provider: CaseParty;
    queue?: { status: string; position: number } | null; messageCount: number };
  cancellation?: { id: string; reason: string; response?: string | null; status: string; resolutionOutcome?: string | null } | null;
  hasPrivateEvidence: boolean; evidenceUrl?: string | null; allowedOutcomes: string[];
  resolutionOperation?: { status: string; stage: string; requestedOutcome: string; requestedPenalty?: string | null; notes?: string; lastError?: string | null } | null;
  decisionExplanation?: string | null; resolution?: string | null; otherBlockingCases?: number;
  history?: { id: string; action: string; reason?: string | null; createdAt: string; actor?: { name: string } | null }[];
}
export interface CaseSummary { active: number; underReview: number; history: number; concerns: Record<string, number> }
export interface CaseMessage { id: string; senderId: string; content: string; imageUrl?: string | null; isSystem: boolean; createdAt: string; sender?: { name: string } }
export type Penalty = 'none' | 'warn' | 'trust_deduct' | 'suspend' | 'ban';
export type CancellationFault = 'none' | 'seeker' | 'provider';
