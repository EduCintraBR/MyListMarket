import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Card, Chip, Text } from 'react-native-paper';

import MesFilterChips from '@/components/MesFilterChips';
import { formatBRL } from '@/lib/money';
import type { HistoricoStackParamList } from '@/navigation/types';
import { useAppStore } from '@/state';

type Props = NativeStackScreenProps<HistoricoStackParamList, 'HistoricoHome'>;

const FORMA_LABEL: Record<string, string> = {
  dinheiro: 'Dinheiro',
  pix: 'Pix',
  cartao_debito: 'Débito',
  cartao_credito: 'Crédito',
  vale_alimentacao: 'Vale',
};

const fmtDate = (ms: number): string => {
  const d = new Date(ms);
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

export default function HistoricoScreen({ navigation }: Props): JSX.Element {
  const compras = useAppStore((s) => s.compras);
  const [mes, setMes] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!mes) return compras;
    return compras.filter((c) => {
      const d = new Date(c.dataHora);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return key === mes;
    });
  }, [compras, mes]);

  return (
    <View style={styles.root}>
      <MesFilterChips value={mes} onChange={setMes} />
      <FlatList
        data={filtered}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhuma compra registrada</Text>
        }
        renderItem={({ item }) => (
          <Card
            style={styles.card}
            onPress={() => navigation.navigate('CompraDetail', { compraId: item.id })}
            accessibilityRole="button"
            accessibilityLabel={`Compra em ${item.mercadoNome} ${formatBRL(item.totalCalculado)}`}
          >
            <Card.Title
              title={`${item.mercadoNome}${item.mercadoArquivado ? ' (arquivado)' : ''}`}
              subtitle={`${fmtDate(item.dataHora)} · ${FORMA_LABEL[item.formaPagamento] ?? item.formaPagamento}`}
              right={() => (
                <Chip compact style={styles.chip}>
                  {formatBRL(item.totalCalculado)}
                </Chip>
              )}
            />
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { padding: 12 },
  card: { marginBottom: 8 },
  chip: { marginRight: 12, alignSelf: 'center' },
  empty: { textAlign: 'center', marginTop: 48 },
});
