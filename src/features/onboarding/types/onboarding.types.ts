import type { UserSession } from '../../../components/auth/LoginContainer';

export type MarketplaceWorkspace = 'seeker' | 'provider';

export interface OnboardingStepProps {
  user: UserSession;
  workspace: MarketplaceWorkspace;
  isDark: boolean;
}

export type OnboardingDestination = 'profile' | 'verification';
