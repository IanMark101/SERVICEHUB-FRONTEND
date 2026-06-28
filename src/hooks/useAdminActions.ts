import React from 'react';
import {
  User,
  CategorySuggestion,
  JobEngagement,
  Transaction,
  UserReport
} from '../types';

interface AdminActionsDeps {
  jobEngagements: JobEngagement[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setCategorySuggestions: React.Dispatch<React.SetStateAction<CategorySuggestion[]>>;
  setJobEngagements: React.Dispatch<React.SetStateAction<JobEngagement[]>>;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  setUserReports: React.Dispatch<React.SetStateAction<UserReport[]>>;
  helperAddNotification: (userId: string, title: string, desc: string) => void;
}

export function useAdminActions({
  jobEngagements,
  setUsers,
  setCategorySuggestions,
  setJobEngagements,
  setTransactions,
  setUserReports,
  helperAddNotification
}: AdminActionsDeps) {

  const verifyProvider = (providerId: string, approve: boolean) => {
    setUsers(prev => prev.map(u => u.id === providerId ? { ...u, isVerified: approve } : u));
    helperAddNotification(
      providerId,
      approve ? 'Provider Verified!' : 'Verification Declined',
      approve
        ? 'Your background check and certificates have been approved by Admin.'
        : 'Your documents did not meet Admin guidelines. Please contact support.'
    );
  };

  const approveCategorySuggestion = (suggestionId: string, approve: boolean) => {
    setCategorySuggestions(prev => prev.map(cs => cs.id === suggestionId ? {
      ...cs,
      status: approve ? 'approved' : 'rejected'
    } : cs));
  };

  const resolveDispute = (jobId: string, payoutToProvider: boolean) => {
    const job = jobEngagements.find(je => je.id === jobId);
    if (!job) return;

    if (payoutToProvider) {
      setJobEngagements(prev => prev.map(je => je.id === jobId ? {
        ...je,
        status: 'completed',
        completedAt: new Date().toISOString().split('T')[0]
      } : je));

      const newTx: Transaction = {
        id: `tx_${Date.now()}`,
        jobId,
        seekerId: job.seekerId,
        providerId: job.providerId,
        amount: job.price,
        paymentMethod: job.paymentMethod,
        serviceTitle: job.title,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setTransactions(prev => [newTx, ...prev]);

      helperAddNotification(job.providerId, 'Dispute Resolved in Your Favor', `Admin ruled on dispute. Payout of ₱${job.price} has been released.`);
      helperAddNotification(job.seekerId, 'Dispute Closed', `Admin resolved dispute. Payout released to Provider.`);
    } else {
      setJobEngagements(prev => prev.map(je => je.id === jobId ? { ...je, status: 'canceled' } : je));
      helperAddNotification(job.seekerId, 'Dispute Resolved in Your Favor', `Admin ruled on dispute. The job has been canceled and your funds returned.`);
      helperAddNotification(job.providerId, 'Dispute Closed', `Admin resolved dispute. Job was canceled and payout withheld.`);
    }

    setUserReports(prev => prev.map(ur => ur.reportedUserId === job.providerId && ur.reporterUserId === job.seekerId
      ? { ...ur, status: 'resolved' }
      : ur
    ));
  };

  return {
    verifyProvider,
    approveCategorySuggestion,
    resolveDispute
  };
}
