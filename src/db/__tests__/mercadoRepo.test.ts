import { makeMercadoRepo } from '@/db/repos/mercadoRepo';
import { createTestDb, type TestDb } from '@/db/testDb';

describe('mercadoRepo', () => {
  let db: TestDb;
  let close: () => void;
  let repo: ReturnType<typeof makeMercadoRepo>;

  beforeEach(() => {
    const t = createTestDb();
    db = t.db;
    close = t.close;
    repo = makeMercadoRepo(db);
  });

  afterEach(() => close());

  it('creates a mercado', () => {
    const m = repo.create({ nome: 'Carrefour', observacoes: 'Vila Mariana' });
    expect(m.id).toBeTruthy();
    expect(m.nome).toBe('Carrefour');
    expect(m.observacoes).toBe('Vila Mariana');
    expect(m.excluidoEm).toBeNull();
  });

  it('rejects empty name', () => {
    expect(() => repo.create({ nome: '' })).toThrow();
    expect(() => repo.create({ nome: '   ' })).toThrow();
  });

  it('list excludes archived by default and returns alphabetical', () => {
    repo.create({ nome: 'Pão de Açúcar' });
    repo.create({ nome: 'Carrefour' });
    const archived = repo.create({ nome: 'Atacadão' });
    repo.softDelete(archived.id);
    const names = repo.list().map((m) => m.nome);
    expect(names).toEqual(['Carrefour', 'Pão de Açúcar']);
  });

  it('list includes archived when requested', () => {
    const a = repo.create({ nome: 'Atacadão' });
    repo.softDelete(a.id);
    expect(repo.list({ includeArchived: true }).map((m) => m.nome)).toEqual(['Atacadão']);
  });

  it('byId returns even archived mercado', () => {
    const a = repo.create({ nome: 'Atacadão' });
    repo.softDelete(a.id);
    const got = repo.byId(a.id);
    expect(got?.nome).toBe('Atacadão');
    expect(got?.excluidoEm).not.toBeNull();
  });

  it('update patches fields', () => {
    const m = repo.create({ nome: 'Carrefour' });
    const updated = repo.update(m.id, { observacoes: 'novo endereço' });
    expect(updated.observacoes).toBe('novo endereço');
    expect(updated.nome).toBe('Carrefour');
  });

  it('softDelete then restore round-trips', () => {
    const m = repo.create({ nome: 'Carrefour' });
    repo.softDelete(m.id);
    expect(repo.list().map((x) => x.id)).not.toContain(m.id);
    repo.restore(m.id);
    expect(repo.list().map((x) => x.id)).toContain(m.id);
  });
});
