import type { AuthCaptchaModel } from './useAuthCaptcha';
import RecaptchaCheckbox from './RecaptchaCheckbox';

export default function AuthCaptcha({ model, isDark }: { model: AuthCaptchaModel; isDark: boolean }) {
  if (model.status === 'loading') return <p role="status" className="py-2 text-sm text-ink-muted">Preparing security verification…</p>;
  if (model.status === 'error') return (
    <div role="alert" className="space-y-2 py-2 text-sm text-rose-700 dark:text-rose-300">
      <p>Security settings could not load. Check your connection, then retry.</p>
      <button type="button" onClick={() => void model.reload()} className="rounded-lg border border-current px-3 py-2 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2">Retry security check</button>
    </div>
  );
  if (!model.required) return null;
  return (
    <div className="space-y-3 pt-3">
      <p className="text-sm text-ink-secondary">Complete the security check to continue.</p>
      <RecaptchaCheckbox siteKey={model.siteKey} isDark={isDark} resetKey={model.resetKey} onToken={model.setToken} />
    </div>
  );
}
