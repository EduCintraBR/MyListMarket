import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { InteractionManager, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text, useTheme } from 'react-native-paper';

import BarRow from '@/components/reports/BarRow';
import PeriodPicker, { rangeForPeriod, type Period } from '@/components/reports/PeriodPicker';
import { formatBRL } from '@/lib/money';
import { useAppStore } from '@/state';
import type { ReportsRepo } from '@/state/slices/settings';

type ReportsData = {
  gastoPeriodo: ReturnType<ReportsRepo['gastoPorPeriodo']>;
  gastoMercado: ReturnType<ReportsRepo['gastoPorMercado']>;
  topFreq: ReturnType<ReportsRepo['topProdutosFreq']>;
  topQtd: ReturnType<ReportsRepo['topProdutosQtd']>;
  topValor: ReturnType<ReportsRepo['topProdutosValor']>;
  formas: ReturnType<ReportsRepo['formasPagamento']>;
  reconc: ReturnType<ReportsRepo['reconciliacao']>;
  fora: ReturnType<ReportsRepo['foraDaLista']>;
  incompletas: ReturnType<ReportsRepo['listasIncompletas']>;
  ticket: ReturnType<ReportsRepo['ticketMedio']>;
};

const computeReports = (
  reports: ReportsRepo,
  range: ReturnType<typeof rangeForPeriod>,
): ReportsData => ({
  gastoPeriodo: reports.gastoPorPeriodo(range, range.bucket),
  gastoMercado: reports.gastoPorMercado(range),
  topFreq: reports.topProdutosFreq(range, 5),
  topQtd: reports.topProdutosQtd(range, 5),
  topValor: reports.topProdutosValor(range, 5),
  formas: reports.formasPagamento(range),
  reconc: reports.reconciliacao(range),
  fora: reports.foraDaLista(range),
  incompletas: reports.listasIncompletas(range),
  ticket: reports.ticketMedio(range),
});

const FORMA_LABEL: Record<string, string> = {
  cartao_credito: 'Cartão crédito',
  cartao_debito: 'Cartão débito',
  dinheiro: 'Dinheiro',
  pix: 'PIX',
  vale_alimentacao: 'Vale alimentação',
};

const UNIT_LABEL: Record<string, string> = {
  kg: 'kg',
  L: 'L',
  un: 'un',
};

const formatQty = (total: number, unidade: string): string => {
  const u = UNIT_LABEL[unidade] ?? unidade;
  return `${total.toFixed(2).replace('.', ',')} ${u}`;
};

const formatPct = (v: number): string => `${(v * 100).toFixed(1).replace('.', ',')}%`;

const maxOf = (arr: number[]): number => arr.reduce((a, b) => Math.max(a, b), 0);

type SectionProps = { title: string; children: React.ReactNode };
const Section = ({ title, children }: SectionProps): JSX.Element => (
  <Card style={styles.card} mode="elevated">
    <Card.Content>
      <Text variant="titleMedium" style={styles.cardTitle} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </Card.Content>
  </Card>
);

const Empty = ({ msg = 'Sem dados no período.' }: { msg?: string }): JSX.Element => (
  <Text variant="bodyMedium" style={styles.empty}>
    {msg}
  </Text>
);

const Skeleton = (): JSX.Element => {
  const theme = useTheme();
  return (
    <View accessibilityLabel="Carregando relatórios" accessibilityRole="progressbar">
      {[0, 1, 2, 3, 4].map((i) => (
        <Card key={i} style={styles.card} mode="elevated">
          <Card.Content>
            <View
              style={[styles.skelTitle, { backgroundColor: theme.colors.surfaceVariant }]}
            />
            <View style={[styles.skelBar, { backgroundColor: theme.colors.surfaceVariant }]} />
            <View style={[styles.skelBar, { backgroundColor: theme.colors.surfaceVariant }]} />
          </Card.Content>
        </Card>
      ))}
    </View>
  );
};

export default function RelatoriosScreen(): JSX.Element {
  const [period, setPeriod] = useState<Period>('month');
  const reports = useAppStore((s) => (s.settingsReady ? s.getReports() : null));
  const comprasCount = useAppStore((s) => s.compras.length);

  const range = useMemo(() => rangeForPeriod(period), [period]);

  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isFocused = useRef<boolean>(false);

  const runQuery = useCallback(() => {
    if (!reports) return;
    setLoading(true);
    const handle = InteractionManager.runAfterInteractions(() => {
      if (!isFocused.current) return;
      setData(computeReports(reports, range));
      setLoading(false);
    });
    return () => handle.cancel();
  }, [reports, range]);

  useFocusEffect(
    useCallback(() => {
      isFocused.current = true;
      const cleanup = runQuery();
      return () => {
        isFocused.current = false;
        cleanup?.();
      };
    }, [runQuery]),
  );

  useEffect(() => {
    if (!isFocused.current) return;
    runQuery();
  }, [comprasCount, runQuery]);

  if (!reports) {
    return (
      <View style={styles.center}>
        <ActivityIndicator accessibilityLabel="Carregando" />
      </View>
    );
  }

  if (loading || !data) {
    return (
      <ScrollView contentContainerStyle={styles.root} testID="relatorios-scroll">
        <PeriodPicker value={period} onChange={setPeriod} />
        <Skeleton />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.root} testID="relatorios-scroll">
      <PeriodPicker value={period} onChange={setPeriod} />

      <Section title="Gasto por período">
        {data.gastoPeriodo.length === 0 ? (
          <Empty />
        ) : (
          (() => {
            const max = maxOf(data.gastoPeriodo.map((b) => b.total));
            return data.gastoPeriodo.map((b) => (
              <BarRow
                key={b.bucket}
                label={b.bucket}
                value={b.total}
                max={max}
                formatValue={formatBRL}
              />
            ));
          })()
        )}
      </Section>

      <Section title="Ticket médio">
        {data.ticket.numCompras === 0 ? (
          <Empty />
        ) : (
          <View style={styles.kvRow}>
            <Text variant="bodyMedium">{`${data.ticket.numCompras} compra(s)`}</Text>
            <Text variant="titleLarge">{formatBRL(data.ticket.ticketMedio)}</Text>
          </View>
        )}
      </Section>

      <Section title="Gasto por mercado">
        {data.gastoMercado.length === 0 ? (
          <Empty />
        ) : (
          (() => {
            const max = maxOf(data.gastoMercado.map((m) => m.total));
            return data.gastoMercado.map((m) => (
              <BarRow
                key={m.mercadoId}
                label={`${m.mercadoNome}${m.mercadoArquivado ? ' (arquivado)' : ''}`}
                value={m.total}
                max={max}
                formatValue={formatBRL}
              />
            ));
          })()
        )}
      </Section>

      <Section title="Produtos mais comprados (frequência)">
        {data.topFreq.length === 0 ? (
          <Empty />
        ) : (
          (() => {
            const max = maxOf(data.topFreq.map((p) => p.numCompras));
            return data.topFreq.map((p) => (
              <BarRow
                key={p.produtoId}
                label={p.produtoNome}
                value={p.numCompras}
                max={max}
                formatValue={(v) => `${v} compra(s)`}
              />
            ));
          })()
        )}
      </Section>

      <Section title="Produtos por quantidade">
        {data.topQtd.length === 0 ? (
          <Empty />
        ) : (
          (() => {
            const max = maxOf(data.topQtd.map((p) => p.total));
            return data.topQtd.map((p) => (
              <BarRow
                key={`${p.produtoId}-${p.familia}`}
                label={p.produtoNome}
                value={p.total}
                max={max}
                formatValue={(v) => formatQty(v, p.unidadeBase)}
              />
            ));
          })()
        )}
      </Section>

      <Section title="Produtos por valor gasto">
        {data.topValor.length === 0 ? (
          <Empty />
        ) : (
          (() => {
            const max = maxOf(data.topValor.map((p) => p.total));
            return data.topValor.map((p) => (
              <BarRow
                key={p.produtoId}
                label={p.produtoNome}
                value={p.total}
                max={max}
                formatValue={formatBRL}
              />
            ));
          })()
        )}
      </Section>

      <Section title="Formas de pagamento">
        {data.formas.length === 0 ? (
          <Empty />
        ) : (
          (() => {
            const max = maxOf(data.formas.map((f) => f.total));
            return data.formas.map((f) => (
              <BarRow
                key={f.formaPagamento}
                label={FORMA_LABEL[f.formaPagamento] ?? f.formaPagamento}
                value={f.total}
                max={max}
                formatValue={(v) => `${formatBRL(v)} (${formatPct(f.pct)})`}
              />
            ));
          })()
        )}
      </Section>

      <Section title="Reconciliação previsto × real">
        {data.reconc.numCompras === 0 || data.reconc.avgDiff === null ? (
          <Empty msg="Nenhuma compra com total real informado." />
        ) : (
          <View>
            <View style={styles.kvRow}>
              <Text variant="bodyMedium">Diferença média</Text>
              <Text variant="bodyMedium">{formatBRL(data.reconc.avgDiff)}</Text>
            </View>
            <View style={styles.kvRow}>
              <Text variant="bodyMedium">Variação média</Text>
              <Text variant="bodyMedium">{formatPct(data.reconc.avgPct ?? 0)}</Text>
            </View>
            <View style={styles.kvRow}>
              <Text variant="bodyMedium">Compras avaliadas</Text>
              <Text variant="bodyMedium">{data.reconc.numCompras}</Text>
            </View>
          </View>
        )}
      </Section>

      <Section title="Itens comprados fora da lista">
        {data.fora.numItens === 0 ? (
          <Empty />
        ) : (
          <View>
            <View style={styles.kvRow}>
              <Text variant="bodyMedium">Quantidade</Text>
              <Text variant="bodyMedium">{`${data.fora.numItens} item(ns)`}</Text>
            </View>
            <View style={styles.kvRow}>
              <Text variant="bodyMedium">Valor total</Text>
              <Text variant="bodyMedium">{formatBRL(data.fora.totalValor)}</Text>
            </View>
            <View style={styles.kvRow}>
              <Text variant="bodyMedium">% do gasto</Text>
              <Text variant="bodyMedium">{formatPct(data.fora.pctValor)}</Text>
            </View>
          </View>
        )}
      </Section>

      <Section title="Listas com pendências">
        {data.incompletas.totalCompras === 0 ? (
          <Empty />
        ) : (
          <View>
            <View style={styles.kvRow}>
              <Text variant="bodyMedium">Compras com pendentes</Text>
              <Text variant="bodyMedium">{`${data.incompletas.numCompras} / ${data.incompletas.totalCompras}`}</Text>
            </View>
            <View style={styles.kvRow}>
              <Text variant="bodyMedium">% do total</Text>
              <Text variant="bodyMedium">{formatPct(data.incompletas.pct)}</Text>
            </View>
          </View>
        )}
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { padding: 12, paddingBottom: 32, gap: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { marginVertical: 4 },
  cardTitle: { marginBottom: 8 },
  kvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  empty: { opacity: 0.6, paddingVertical: 8 },
  skelTitle: { height: 18, width: '40%', borderRadius: 4, marginBottom: 12 },
  skelBar: { height: 12, width: '100%', borderRadius: 4, marginVertical: 6 },
});
