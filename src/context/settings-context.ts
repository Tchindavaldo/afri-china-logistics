import { createContext, useContext } from 'react';
import type { SiteSettings } from '../types';
import { DEFAULT_SETTINGS } from '../lib/site';

export interface SettingsContextValue {
  settings: SiteSettings;
  loading: boolean;
  /** Recharge après une modification dans l'admin. */
  reload: () => Promise<void>;
}

export const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  loading: true,
  reload: async () => {},
});

export function useSiteSettings() {
  return useContext(SettingsContext);
}
