export interface RecaptchaApi {
  render(container: HTMLElement, options: {
    sitekey: string; theme: 'light' | 'dark'; size: 'normal' | 'compact';
    callback: (token: string) => void;
    'expired-callback': () => void;
    'error-callback': () => void;
  }): number;
  reset(widgetId: number): void;
}

declare global {
  interface Window {
    grecaptcha?: RecaptchaApi;
    serviceHubRecaptchaReady?: () => void;
  }
}

let sdkRequest: Promise<RecaptchaApi> | undefined;
export function loadRecaptcha(): Promise<RecaptchaApi> {
  if (window.grecaptcha?.render) return Promise.resolve(window.grecaptcha);
  if (sdkRequest) return sdkRequest;
  sdkRequest = new Promise<RecaptchaApi>((resolve, reject) => {
    const script = document.createElement('script');
    let settled = false;
    const failed = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      script.onerror = null;
      script.remove();
      sdkRequest = undefined;
      reject(new Error('Security check could not load.'));
    };
    const timeout = window.setTimeout(failed, 10_000);
    // Define the callback before loading Google's SDK. Late callbacks after a
    // failed attempt must not clear or settle a subsequent retry's promise.
    window.serviceHubRecaptchaReady = () => {
      if (settled) return;
      if (!window.grecaptcha?.render) { failed(); return; }
      settled = true;
      window.clearTimeout(timeout);
      script.onerror = null;
      resolve(window.grecaptcha);
    };
    script.src = 'https://www.google.com/recaptcha/api.js?onload=serviceHubRecaptchaReady&render=explicit';
    script.async = true;
    script.defer = true;
    script.onerror = failed;
    document.head.appendChild(script);
  });
  return sdkRequest;
}
