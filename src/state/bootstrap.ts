import { db } from '@/db/client';
import { makeCompraRepo } from '@/db/repos/compraRepo';
import { makeItemListaRepo } from '@/db/repos/itemListaRepo';
import { makeKvRepo } from '@/db/repos/kvRepo';
import { makeListaRepo } from '@/db/repos/listaRepo';
import { makeMercadoRepo } from '@/db/repos/mercadoRepo';
import { makeProdutoRepo } from '@/db/repos/produtoRepo';
import { makeReportsRepo } from '@/db/repos/reportsRepo';

import { useAppStore } from '.';

export const bootstrapStores = (): void => {
  const d = db();
  const produtoRepo = makeProdutoRepo(d);
  const mercadoRepo = makeMercadoRepo(d);
  const listaRepo = makeListaRepo(d);
  const itemListaRepo = makeItemListaRepo(d);
  const compraRepo = makeCompraRepo(d);
  const kvRepo = makeKvRepo(d);
  const reportsRepo = makeReportsRepo(d);
  const store = useAppStore.getState();
  store.initSettings(kvRepo, reportsRepo);
  store.initProdutos(produtoRepo);
  store.initMercados(mercadoRepo);
  store.initListas(listaRepo, itemListaRepo);
  store.initCompraAtiva(listaRepo, itemListaRepo);
  store.initCompras(compraRepo, listaRepo);
  store.restoreCompraAtiva();
};
