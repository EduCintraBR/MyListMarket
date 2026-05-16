import { makeKvRepo } from '@/db/repos/kvRepo';
import { createTestDb } from '@/db/testDb';

describe('kvRepo', () => {
  it('set then get round-trip', () => {
    const t = createTestDb();
    const kv = makeKvRepo(t.db);
    expect(kv.get('foo')).toBeNull();
    kv.set('foo', 'bar');
    expect(kv.get('foo')).toBe('bar');
    t.close();
  });

  it('set overwrites existing value', () => {
    const t = createTestDb();
    const kv = makeKvRepo(t.db);
    kv.set('themeMode', 'light');
    kv.set('themeMode', 'dark');
    expect(kv.get('themeMode')).toBe('dark');
    t.close();
  });

  it('remove deletes a key', () => {
    const t = createTestDb();
    const kv = makeKvRepo(t.db);
    kv.set('x', '1');
    kv.remove('x');
    expect(kv.get('x')).toBeNull();
    t.close();
  });
});
