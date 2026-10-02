import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase, TABLES } from '../lib/supabase';
import { DEFAULT_SETTINGS } from '../lib/site';
import type { SiteSettings } from '../types';
import { SettingsContext } from './settings-context';

function merge(row: Partial<SiteSettings> | null): SiteSettings {
  if (!row) return DEFAULT_SETTINGS;
  const out = { ...DEFAULT_SETTINGS };
  for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof SiteSettings)[]) {
    const v = row[key];
    if (typeof v === 'string' && v.trim() !== '') out[key] = v;
  }
  return out;
}

export default function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const { data, error } = await supabase.from(TABLES.settings).select('*').eq('id', 1).maybeSingle();
    if (error) console.error('Paramètres du site indisponibles :', error.message);
    setSettings(merge(data));
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chargement initial depuis Supabase
    void reload();
  }, [reload]);

  const value = useMemo(() => ({ settings, loading, reload }), [settings, loading, reload]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
