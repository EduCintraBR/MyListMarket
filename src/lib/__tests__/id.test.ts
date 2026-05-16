import { newId } from '@/lib/id';

describe('newId', () => {
  it('returns a v4 UUID string', () => {
    const id = newId();
    expect(typeof id).toBe('string');
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('returns a different id on each call', () => {
    const a = newId();
    const b = newId();
    expect(a).not.toBe(b);
  });
});
