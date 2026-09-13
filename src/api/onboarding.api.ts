import { api } from '../lib/api/axios';

export type OnboardingChoice = 'COMPLETED' | 'SKIPPED';

export async function apiUpdateOnboardingStatus(status: OnboardingChoice) {
  const response = await api.patch('/users/me/onboarding', { status });
  return response.data;
}
