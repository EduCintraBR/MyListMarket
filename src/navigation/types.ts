export type ConfigStackParamList = {
  ConfigHome: undefined;
  Catalogo: undefined;
  EditProduto: { produtoId?: string };
  Mercados: undefined;
  EditMercado: { mercadoId?: string };
  Sobre: undefined;
};

export type ListasStackParamList = {
  HomeListas: undefined;
  ListaDetail: { listaId: string };
  CompraMode: { listaId: string };
  CheckoutConfirm: { listaId: string };
  CheckoutForm: { listaId: string };
  CheckoutFoto: { listaId: string };
  CheckoutResumo: { listaId: string };
  CheckoutDestino: { listaId: string };
};

export type HistoricoStackParamList = {
  HistoricoHome: undefined;
  CompraDetail: { compraId: string };
};

export type RootTabsParamList = {
  ListasStack: undefined;
  HistoricoStack: undefined;
  Relatorios: undefined;
  ConfigStack: undefined;
};
