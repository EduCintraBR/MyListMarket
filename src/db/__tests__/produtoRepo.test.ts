import { makeProdutoRepo } from '@/db/repos/produtoRepo';
import { createTestDb, type TestDb } from '@/db/testDb';

describe('produtoRepo', () => {
  let db: TestDb;
  let close: () => void;
  let repo: ReturnType<typeof makeProdutoRepo>;

  beforeEach(() => {
    const t = createTestDb();
    db = t.db;
    close = t.close;
    repo = makeProdutoRepo(db);
  });

  afterEach(() => close());

  describe('getOrCreate', () => {
    it('creates a new produto when none exists', () => {
      const p = repo.getOrCreate('Arroz');
      expect(p.nome).toBe('Arroz');
      expect(p.id).toBeTruthy();
      expect(p.criadoEm).toBeGreaterThan(0);
      expect(p.excluidoEm).toBeNull();
    });

    it('reuses an existing produto by case-insensitive name', () => {
      const a = repo.getOrCreate('Arroz');
      const b = repo.getOrCreate('arroz');
      const c = repo.getOrCreate('ARROZ');
      expect(b.id).toBe(a.id);
      expect(c.id).toBe(a.id);
    });

    it('reuses existing produto with same diacritics-stripped name', () => {
      const a = repo.getOrCreate('Arróz');
      const b = repo.getOrCreate('Arroz');
      expect(b.id).toBe(a.id);
    });

    it('reuses existing produto when called with extra whitespace', () => {
      const a = repo.getOrCreate('Açúcar');
      const b = repo.getOrCreate('  açucar  ');
      expect(b.id).toBe(a.id);
    });

    it('preserves the user-typed original name on first insert', () => {
      const p = repo.getOrCreate('Café Especial');
      expect(p.nome).toBe('Café Especial');
    });

    it('rejects empty/whitespace-only names', () => {
      expect(() => repo.getOrCreate('')).toThrow();
      expect(() => repo.getOrCreate('   ')).toThrow();
    });
  });

  describe('list', () => {
    it('returns non-deleted produtos ordered alphabetically (case-insensitive)', () => {
      repo.getOrCreate('banana');
      repo.getOrCreate('Arroz');
      repo.getOrCreate('Cebola');
      const out = repo.list();
      expect(out.map((p) => p.nome)).toEqual(['Arroz', 'banana', 'Cebola']);
    });

    it('excludes soft-deleted by default', () => {
      const a = repo.getOrCreate('Arroz');
      repo.softDelete(a.id);
      expect(repo.list().map((p) => p.nome)).toEqual([]);
    });

    it('includes deleted when includeDeleted=true', () => {
      const a = repo.getOrCreate('Arroz');
      repo.softDelete(a.id);
      expect(repo.list({ includeDeleted: true }).map((p) => p.nome)).toEqual(['Arroz']);
    });
  });

  describe('search', () => {
    it('matches by case-insensitive prefix', () => {
      repo.getOrCreate('Arroz Branco');
      repo.getOrCreate('Arroz Integral');
      repo.getOrCreate('Banana');
      const out = repo.search('arr');
      expect(out.map((p) => p.nome).sort()).toEqual(['Arroz Branco', 'Arroz Integral']);
    });

    it('matches by diacritics-insensitive substring', () => {
      repo.getOrCreate('Açúcar Mascavo');
      const out = repo.search('acucar');
      expect(out).toHaveLength(1);
      expect(out[0]?.nome).toBe('Açúcar Mascavo');
    });

    it('respects limit', () => {
      for (let i = 0; i < 10; i++) repo.getOrCreate(`Produto ${i}`);
      const out = repo.search('produto', 3);
      expect(out).toHaveLength(3);
    });

    it('excludes soft-deleted', () => {
      const a = repo.getOrCreate('Arroz');
      repo.softDelete(a.id);
      expect(repo.search('arr')).toEqual([]);
    });
  });

  describe('update', () => {
    it('updates the requested fields and preserves the rest', () => {
      const a = repo.getOrCreate('Arroz');
      const updated = repo.update(a.id, { marcaPadrao: 'Tio João', unidadePadrao: 'kg' });
      expect(updated.marcaPadrao).toBe('Tio João');
      expect(updated.unidadePadrao).toBe('kg');
      expect(updated.nome).toBe('Arroz');
    });
  });

  describe('softDelete', () => {
    it('marks excluido_em with current ms', () => {
      const a = repo.getOrCreate('Arroz');
      repo.softDelete(a.id);
      const rows = repo.list({ includeDeleted: true });
      expect(rows[0]?.excluidoEm).not.toBeNull();
      expect(rows[0]?.excluidoEm).toBeGreaterThan(0);
    });
  });
});
