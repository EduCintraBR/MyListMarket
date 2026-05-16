import { sql } from 'drizzle-orm';
import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import type {
  FormaPagamento,
  OrigemItem,
  StatusItem,
  StatusLista,
  UnidadeMedida,
} from '@/lib/domain';

export const produtos = sqliteTable(
  'produtos',
  {
    id: text('id').primaryKey(),
    nome: text('nome').notNull(),
    marcaPadrao: text('marca_padrao'),
    modeloPadrao: text('modelo_padrao'),
    unidadePadrao: text('unidade_padrao').$type<UnidadeMedida>(),
    criadoEm: integer('criado_em').notNull(),
    excluidoEm: integer('excluido_em'),
  },
  (t) => ({
    nomeIdx: index('idx_produto_nome').on(t.nome),
  }),
);

export const mercados = sqliteTable('mercados', {
  id: text('id').primaryKey(),
  nome: text('nome').notNull(),
  observacoes: text('observacoes'),
  criadoEm: integer('criado_em').notNull(),
  excluidoEm: integer('excluido_em'),
});

export const listas = sqliteTable('listas', {
  id: text('id').primaryKey(),
  nome: text('nome'),
  status: text('status').$type<StatusLista>().notNull(),
  criadoEm: integer('criado_em').notNull(),
  finalizadaEm: integer('finalizada_em'),
  excluidoEm: integer('excluido_em'),
});

export const itensLista = sqliteTable(
  'itens_lista',
  {
    id: text('id').primaryKey(),
    listaId: text('lista_id').notNull(),
    produtoId: text('produto_id').notNull(),
    quantidadePlanejada: real('quantidade_planejada'),
    marca: text('marca'),
    modelo: text('modelo'),
    unidade: text('unidade').$type<UnidadeMedida>(),
    origem: text('origem').$type<OrigemItem>().notNull().default('lista'),
    status: text('status').$type<StatusItem>().notNull().default('a_comprar'),
    quantidadeComprada: real('quantidade_comprada'),
    precoUnitario: real('preco_unitario'),
    criadoEm: integer('criado_em').notNull(),
  },
  (t) => ({
    listaIdx: index('idx_item_lista_id').on(t.listaId),
    produtoIdx: index('idx_item_produto_id').on(t.produtoId),
  }),
);

export const compras = sqliteTable(
  'compras',
  {
    id: text('id').primaryKey(),
    listaId: text('lista_id').notNull(),
    mercadoId: text('mercado_id').notNull(),
    dataHora: integer('data_hora').notNull(),
    formaPagamento: text('forma_pagamento').$type<FormaPagamento>().notNull(),
    totalCalculado: real('total_calculado').notNull(),
    totalReal: real('total_real'),
    fotoCupomPath: text('foto_cupom_path'),
    criadoEm: integer('criado_em').notNull(),
    excluidoEm: integer('excluido_em'),
  },
  (t) => ({
    dataIdx: index('idx_compra_data').on(t.dataHora),
    mercadoIdx: index('idx_compra_mercado').on(t.mercadoId),
  }),
);

export const kv = sqliteTable('kv', {
  k: text('k').primaryKey(),
  v: text('v').notNull(),
});

export const NOW_MS = sql<number>`(strftime('%s','now') * 1000)`;
