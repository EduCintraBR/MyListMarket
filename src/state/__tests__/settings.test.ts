import { makeKvRepo } from '@/db/repos/kvRepo';
import { makeReportsRepo } from '@/db/repos/reportsRepo';
import { createTestDb } from '@/db/testDb';
import { useAppStore } from '@/state';

describe('settings slice', () => {
  beforeEach(() => {
    useAppStore.setState({
      themeMode: 'system',
      settingsReady: false,
      _kvRepo: null,
    });
  });

  it('initSettings reads persisted theme from kv (defaults to system)', () => {
    const t = createTestDb();
    const kv = makeKvRepo(t.db);
    kv.set('settings.themeMode', 'dark');
    useAppStore.getState().initSettings(kv, makeReportsRepo(t.db));
    expect(useAppStore.getState().themeMode).toBe('dark');
    expect(useAppStore.getState().settingsReady).toBe(true);
    t.close();
  });

  it('initSettings falls back to system when nothing stored', () => {
    const t = createTestDb();
    useAppStore.getState().initSettings(makeKvRepo(t.db), makeReportsRepo(t.db));
    expect(useAppStore.getState().themeMode).toBe('system');
    t.close();
  });

  it('setThemeMode persists to kv and survives re-init', () => {
    const t = createTestDb();
    const kv = makeKvRepo(t.db);
    useAppStore.getState().initSettings(kv, makeReportsRepo(t.db));
    useAppStore.getState().setThemeMode('light');
    expect(useAppStore.getState().themeMode).toBe('light');
    expect(kv.get('settings.themeMode')).toBe('light');

    // Simulate restart
    useAppStore.setState({ themeMode: 'system', settingsReady: false, _kvRepo: null });
    useAppStore.getState().initSettings(makeKvRepo(t.db), makeReportsRepo(t.db));
    expect(useAppStore.getState().themeMode).toBe('light');
    t.close();
  });

  it('throws when setThemeMode called before init', () => {
    expect(() => useAppStore.getState().setThemeMode('dark')).toThrow(/not initialized/);
  });
});
