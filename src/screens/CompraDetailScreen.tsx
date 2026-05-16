import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Divider, List, Text } from 'react-native-paper';

import CupomViewer from '@/components/CupomViewer';
import { formatBRL } from '@/lib/money';
import type { HistoricoStackParamList } from '@/navigation/types';
import { useAppStore } from '@/state';

type Props = NativeStackScreenProps<HistoricoStackParamList, 'CompraDetail'>;

const FORMA_LABEL: Record<string, string> = {
  dinheiro: 'Dinheiro',
  pix: 'Pix',
  cartao_debito: 'Débito',
  cartao_credito: 'Crédito',
  vale_alimentacao: 'Vale',
};

const fmtDateTime = (ms: number): string => {
  const d = new Date(ms);
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function CompraDetailScreen({ route, navigation }: Props): JSX.Element {
  const { compraId } = route.params;
  const getCompraDetail = useAppStore((s) => s.getCompraDetail);
  const softDeleteCompra = useAppStore((s) => s.softDeleteCompra);
  const compras = useAppStore((s) => s.compras);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const detail = useMemo(() => getCompraDetail(compraId), [compraId, getCompraDetail, compras]);

  if (!detail) {
    return (
      <View style={styles.empty}>
        <Text>Compra não encontrada</Text>
      </View>
    );
  }

  const itensComprados = detail.items.filter(
    (i) => i.quantidadeComprada != null && i.precoUnitario != null,
  );
  const itensPendentes = detail.items.filter(
    (i) => i.quantidadeComprada == null || i.precoUnitario == null,
  );
  const diff =
    detail.totalReal != null ? detail.totalReal - detail.totalCalculado : null;

  const handleDelete = (): void => {
    Alert.alert(
      'Excluir compra',
      'Tem certeza? A compra ficará oculta do histórico (mas permanece no banco).',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            softDeleteCompra(compraId);
            navigation.goBack();
          },
        },
      ],
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <Text variant="titleLarge" accessibilityRole="header">
        {detail.mercadoNome}
        {detail.mercadoArquivado ? ' (arquivado)' : ''}
      </Text>
      <Text variant="bodyMedium">{fmtDateTime(detail.dataHora)}</Text>
      <Text variant="bodyMedium">
        Pagamento: {FORMA_LABEL[detail.formaPagamento] ?? detail.formaPagamento}
      </Text>

      {detail.fotoCupomPath ? (
        <View style={styles.cupom}>
          <CupomViewer relativePath={detail.fotoCupomPath} />
        </View>
      ) : null}

      <Divider style={styles.divider} />
      <Text variant="titleSmall">Itens comprados ({itensComprados.length})</Text>
      {itensComprados.map((i) => (
        <List.Item
          key={i.id}
          title={i.produtoNome + (i.origem === 'compra' ? ' (adicionado)' : '')}
          description={`${i.quantidadeComprada} × ${formatBRL(i.precoUnitario ?? 0)}`}
          right={() => (
            <Text>
              {formatBRL((i.quantidadeComprada ?? 0) * (i.precoUnitario ?? 0))}
            </Text>
          )}
        />
      ))}

      {itensPendentes.length > 0 ? (
        <>
          <Divider style={styles.divider} />
          <Text variant="titleSmall">Não comprados ({itensPendentes.length})</Text>
          {itensPendentes.map((i) => (
            <List.Item key={i.id} title={i.produtoNome} />
          ))}
        </>
      ) : null}

      <Divider style={styles.divider} />
      <View style={styles.row}>
        <Text variant="titleMedium">Total calculado</Text>
        <Text variant="titleMedium">{formatBRL(detail.totalCalculado)}</Text>
      </View>
      {detail.totalReal != null ? (
        <>
          <View style={styles.row}>
            <Text variant="bodyMedium">Total real</Text>
            <Text variant="bodyMedium">{formatBRL(detail.totalReal)}</Text>
          </View>
          <View style={styles.row}>
            <Text variant="bodyMedium">Diferença</Text>
            <Text variant="bodyMedium">{diff != null ? formatBRL(diff) : '—'}</Text>
          </View>
        </>
      ) : null}

      <View style={styles.gap} />
      <Button onPress={handleDelete} mode="text" textColor="red" testID="delete-compra">
        Excluir compra
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { padding: 16, gap: 6 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cupom: { marginTop: 12 },
  divider: { marginVertical: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  gap: { height: 24 },
});
