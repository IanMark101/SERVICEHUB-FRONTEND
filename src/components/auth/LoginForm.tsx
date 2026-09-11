import { Eye, EyeOff, Loader2 } from 'lucide-react';
import type { FormEvent } from 'react';
import type { UseFormRegister } from 'react-hook-form';
import type { AuthFormValues } from '../../schema/auth/useAuthForm';
import AuthInput from './shared/AuthInput';
import GoogleSignInButton from './shared/GoogleSignInButton';

interface LoginFormProps {
  formData: AuthFormValues;
  fieldErrors: Record<string, string>;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  handleGoogleSuccessResponse: (token: string) => void;
  setError: (msg: string) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isDark: boolean;
  accentText: string;
  setMode: (mode: 'login' | 'signup' | 'forgot' | 'reset') => void;
  toggleMode: () => void;
  register: UseFormRegister<AuthFormValues>;
  isLoading?: boolean;
}

export default function LoginForm({ fieldErrors, showPassword, setShowPassword, handleGoogleSuccessResponse, setError, handleSubmit, isDark, setMode, toggleMode, register, isLoading = false }: LoginFormProps) {
  return (
    <div>
      <div className="mb-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c86544]">Account access</p>
        <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.035em] text-slate-950 dark:text-white">Welcome back</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-stone-400">Sign in to continue to your ServiceHub workspace.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput label="Email" type="email" placeholder="you@example.com" error={fieldErrors.email} autoComplete="email" {...register('email')} />
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-stone-300">Password</label>
            <button type="button" onClick={() => setMode('forgot')} className="text-xs font-bold text-[#c86544] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c86544]">Forgot password?</button>
          </div>
          <AuthInput label="" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" error={fieldErrors.password} autoComplete="current-password" {...register('password')}>
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-700 dark:hover:text-stone-200" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
          </AuthInput>
        </div>
        <button type="submit" disabled={isLoading} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c86544] px-5 text-sm font-bold text-white transition-colors hover:bg-[#b95738] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500 dark:disabled:bg-stone-700 dark:disabled:text-stone-400">
          {isLoading ? <><Loader2 className="size-4 animate-spin" /><span>Signing in</span></> : <span>Sign in</span>}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400 before:h-px before:flex-1 before:bg-stone-200 after:h-px after:flex-1 after:bg-stone-200 dark:before:bg-white/10 dark:after:bg-white/10">or</div>
      <GoogleSignInButton onSuccess={handleGoogleSuccessResponse} onError={setError} isDark={isDark} mode="login" />
      <p className="mt-7 border-t border-stone-200 pt-5 text-center text-sm text-slate-500 dark:border-white/10 dark:text-stone-400">New to ServiceHub?<button type="button" onClick={toggleMode} className="ml-1.5 font-bold text-[#c86544] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c86544]">Create an account</button></p>
    </div>
  );
}
