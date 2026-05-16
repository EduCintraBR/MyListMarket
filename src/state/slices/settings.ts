import type { StateCreator } from 'zustand';

import type { makeKvRepo } from '@/db/repos/kvRepo';
import type { makeReportsRepo } from '@/db/repos/reportsRepo';

export type ThemeMode = 'system' | 'light' | 'dark';

export type KvRepo = ReturnType<typeof makeKvRepo>;
export type ReportsRepo = ReturnType<typeof makeReportsRepo>;

const KEY_THEME = 'settings.themeMode';

const isThemeMode = (s: string): s is ThemeMode =>
  s === 'system' || s === 'light' || s === 'dark';

export type SettingsSlice = {
  themeMode: ThemeMode;
  settingsReady: boolean;
  _kvRepo: KvRepo | null;
  _reportsRepo: ReportsRepo | null;
  initSettings: (kvRepo: KvRepo, reportsRepo: ReportsRepo) => void;
  setThemeMode: (mode: ThemeMode) => void;
  getReports: () => ReportsRepo;
};

const requireRepo = (repo: KvRepo | null): KvRepo => {
  if (!repo) throw new Error('SettingsSlice: kvRepo not initialized — call initSettings first');
  return repo;
};

const requireReports = (repo: ReportsRepo | null): ReportsRepo => {
  if (!repo) throw new Error('SettingsSlice: reportsRepo not initialized — call initSettings first');
  return repo;
};

export const createSettingsSlice: StateCreator<SettingsSlice> = (set, get) => ({
  themeMode: 'system',
  settingsReady: false,
  _kvRepo: null,
  _reportsRepo: null,

  initSettings: (kvRepo, reportsRepo) => {
    const stored = kvRepo.get(KEY_THEME);
    const themeMode: ThemeMode = stored && isThemeMode(stored) ? stored : 'system';
    set({ _kvRepo: kvRepo, _reportsRepo: reportsRepo, themeMode, settingsReady: true });
  },

  setThemeMode: (mode) => {
    const repo = requireRepo(get()._kvRepo);
    repo.set(KEY_THEME, mode);
    set({ themeMode: mode });
  },

  getReports: () => requireReports(get()._reportsRepo),
});
