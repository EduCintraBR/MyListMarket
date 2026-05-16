import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Divider, List, Text } from 'react-native-paper';

import CheckoutStepHeader from '@/components/CheckoutStepHeader';
import { deleteIfExists } from '@/lib/image';
import { log } from '@/lib/log';
import { formatBRL } from '@/lib/money';
import type { ListasStackParamList } from '@/navigation/types';
import { useAppStore } from '@/state';

type Props = NativeStackScreenProps<ListasStackParamList, 'CheckoutResumo'>;

const FORMA_LABEL: Record<string, string> = {
  dinheiro: 'Dinheiro',
  pix: 'Pix',
  cartao_debito: 'Débito',
  cartao_credito: 'Crédito',
  vale_alimentacao: 'Vale',
};

export default function CheckoutResumoScreen({ route, navigation }: Props): JSX.Element {
  const { listaId } = route.params;
  const items = useAppStore((s) => s.compraAtivaItems);
  const total = useAppStore((s) => s.compraAtivaTotal);
  const mercadoId = useAppStore((s) => s.draftMercadoId);
  const mercadoNome = useAppStore(
    (s) => s.mercados.find((m) => m.id === mercadoId)?.nome ?? '?',
  );
  const formaPagamento = useAppStore((s) => s.draftFormaPagamento);
  const totalReal = useAppStore((s) => s.draftTotalReal);
  const fotoCupomPath = useAppStore((s) => s.draftFotoCupomPath);
  const concluir = useAppStore((s) => s.concluirCompra);

  const comprados = items.filter((i) => i.status === 'comprado');
  const pendentes = items.filter((i) => i.status !== 'comprado');
  const diff = totalReal != null ? totalReal - total : null;

  const handleConcluir = (): void => {
    if (!mercadoId || !formaPagamento) {
      Alert.alert('Faltam dados', 'Mercado e forma de pagamento são obrigatórios.');
      return;
    }
    try {
      concluir({
        mercadoId,
        formaPagamento,
        totalReal,
        fotoCupomPath,
      });
      if (pendentes.length > 0) {
        navigation.navigate('CheckoutDestino', { listaId });
      } else {
        navigation.popToTop();
      }
    } catch (e) {
      if (fotoCupomPath) {
        void deleteIfExists(fotoCupomPath);
      }
      const msg = e instanceof Error ? e.message : String(e);
      log.error('[Resumo] concluir failed', msg);
      Alert.alert('Erro ao concluir', msg);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <CheckoutStepHeader step={4} label="Resumo" />
      <Text variant="titleMedium" accessibilityRole="header">
        Resumo
      </Text>
      <Text variant="bodyMedium">Mercado: {mercadoNome}</Text>
      <Text variant="bodyMedium">
        Pagamento: {formaPagamento ? (FORMA_LABEL[formaPagamento] ?? formaPagamento) : '—'}
      </Text>
      <Divider style={styles.divider} />

      <Text variant="titleSmall">Itens comprados ({comprados.length})</Text>
      {comprados.map((i) => (
        <List.Item
          key={i.id}
          title={i.produtoNome}
          description={`${i.quantidadeComprada} × ${formatBRL(i.precoUnitario ?? 0)}`}
          right={() => (
            <Text>
              {formatBRL((i.quantidadeComprada ?? 0) * (i.precoUnitario ?? 0))}
            </Text>
          )}
        />
      ))}

      {pendentes.length > 0 ? (
        <>
          <Divider style={styles.divider} />
          <Text variant="titleSmall">Não comprados ({pendentes.length})</Text>
          {pendentes.map((i) => (
            <List.Item key={i.id} title={i.produtoNome} />
          ))}
        </>
      ) : null}

      <Divider style={styles.divider} />
      <View style={styles.totalRow}>
        <Text variant="titleMedium">Total calculado</Text>
        <Text variant="titleMedium" testID="resumo-total-calc">
          {formatBRL(total)}
        </Text>
      </View>
      {totalReal != null ? (
        <>
          <View style={styles.totalRow}>
            <Text variant="bodyMedium">Total real</Text>
            <Text variant="bodyMedium">{formatBRL(totalReal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text variant="bodyMedium">Diferença</Text>
            <Text variant="bodyMedium" testID="resumo-diff">
              {diff != null ? formatBRL(diff) : '—'}
            </Text>
          </View>
        </>
      ) : null}

      <View style={styles.gap} />
      <Button mode="contained" onPress={handleConcluir} testID="concluir-compra">
        Concluir
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { padding: 16, gap: 6 },
  divider: { marginVertical: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  gap: { height: 16 },
});
