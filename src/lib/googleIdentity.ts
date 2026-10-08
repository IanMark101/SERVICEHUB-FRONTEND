export interface GoogleCredentialResponse { credential?: string }
export interface GoogleIdentityConfig {
  client_id: string;
  nonce?: string;
  auto_select: boolean;
  cancel_on_tap_outside: boolean;
  use_fedcm_for_button: boolean;
}
export interface GoogleIdentityApi {
  initialize: (options: GoogleIdentityConfig & { callback: (response: GoogleCredentialResponse) => void }) => void;
  renderButton: (container: HTMLElement, options: { theme: string; size: string; shape: string; width: number }) => void;
}

declare global {
  interface Window { google?: { accounts?: { id?: GoogleIdentityApi } } }
}

type Binding = { callback: (response: GoogleCredentialResponse) => void };
type IdentityState = { config: string; binding?: Binding };
const identities = new WeakMap<GoogleIdentityApi, IdentityState>();

/** GSI has one configuration per page. Reuse it across auth route remounts. */
export function bindGoogleIdentity(api: GoogleIdentityApi, config: GoogleIdentityConfig, callback: Binding['callback']) {
  const key = JSON.stringify(config);
  const previous = identities.get(api);
  const binding = { callback };
  const state: IdentityState = previous?.config === key ? previous : { config: key };
  state.binding = binding;
  if (state !== previous) {
    identities.set(api, state);
    try {
      // Account verification needs its own server-issued nonce. A changed
      // security configuration must replace GSI's previous configuration.
      api.initialize({ ...config, callback: response => {
        if (identities.get(api) === state) state.binding?.callback(response);
      } });
    } catch (error) {
      if (previous) identities.set(api, previous);
      else identities.delete(api);
      throw error;
    }
  }
  return () => { if (state.binding === binding) state.binding = undefined; };
}
