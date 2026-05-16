import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { Checkbox, FAB, List, Text } from 'react-native-paper';

import AddItemEmCompraForm from '@/components/AddItemEmCompraForm';
import FiltroChips, { type CompraFiltro } from '@/components/FiltroChips';
import MarcarItemSheet from '@/components/MarcarItemSheet';
import MercadoPicker from '@/components/MercadoPicker';
import TotalParcialHeader from '@/components/TotalParcialHeader';
import type { ItemListaWithProduto } from '@/db/repos/itemListaRepo';
import { formatBRL } from '@/lib/money';
import type { ListasStackParamList } from '@/navigation/types';
import { useAppStore } from '@/state';

type Props = NativeStackScreenProps<ListasStackParamList, 'CompraMode'>;

const STATUS_FILTERS = new Set<CompraFiltro>(['a_comprar', 'comprado']);
const ORIGEM_FILTERS = new Set<CompraFiltro>(['da_lista', 'compra']);

const matchesFilters = (
  item: ItemListaWithProduto,
  selected: ReadonlySet<CompraFiltro>,
): boolean => {
  const statusFilters = [...selected].filter((f) => STATUS_FILTERS.has(f));
  const origemFilters = [...selected].filter((f) => ORIGEM_FILTERS.has(f));

  const statusOK =
    statusFilters.length === 0 ||
    statusFilters.includes(item.status as CompraFiltro);
  const origemOK =
    origemFilters.length === 0 ||
    (origemFilters.includes('da_lista') && item.origem === 'lista') ||
    (origemFilters.includes('compra') && item.origem === 'compra');

  return statusOK && origemOK;
};

const fmtSubtitle = (item: ItemListaWithProduto): string => {
  if (item.status === 'comprado' && item.quantidadeComprada != null && item.precoUnitario != null) {
    return `${item.quantidadeComprada} × ${formatBRL(item.precoUnitario)}`;
  }
  if (item.quantidadePlanejada != null) {
    return `${item.quantidadePlanejada}${item.unidade ? ` ${item.unidade}` : ''}`;
  }
  return '';
};

export default function CompraModeScreen({ route, navigation }: Props): JSX.Element {
  const items = useAppStore((s) => s.compraAtivaItems);
  const total = useAppStore((s) => s.compraAtivaTotal);
  const mercadoId = useAppStore((s) => s.compraAtivaMercadoId);
  const mercadoNome = useAppStore(
    (s) => s.mercados.find((m) => m.id === mercadoId)?.nome ?? null,
  );
  const setMercado = useAppStore((s) => s.setMercadoCompra);
  const marcarItem = useAppStore((s) => s.marcarItemCompra);
  const voltarItem = useAppStore((s) => s.voltarItemCompra);
  const removerUnplanned = useAppStore((s) => s.removerUnplannedCompra);

  const [filters, setFilters] = useState<Set<CompraFiltro>>(new Set());
  const [mercadoModalVisible, setMercadoModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemListaWithProduto | null>(null);

  const filtered = useMemo(() => items.filter((i) => matchesFilters(i, filters)), [items, filters]);

  const toggleFilter = (f: CompraFiltro): void => {
    setFilters((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  };

  const handleRowPress = (item: ItemListaWithProduto): void => {
    setEditingItem(item);
  };

  const handleConfirmMarcar = (qtd: number, preco: number): void => {
    if (!editingItem) return;
    marcarItem(editingItem.id, qtd, preco);
    setEditingItem(null);
  };

  const handleLongPress = (item: ItemListaWithProduto): void => {
    if (item.status !== 'comprado') return;
    const buttons = [
      { text: 'Cancelar', style: 'cancel' as const },
      {
        text: 'Voltar para a comprar',
        onPress: () => voltarItem(item.id),
      },
    ];
    if (item.origem === 'compra') {
      buttons.push({
        text: 'Remover de vez',
        onPress: () => removerUnplanned(item.id),
      });
    }
    Alert.alert(item.produtoNome, 'O que fazer?', buttons);
  };

  const handleConcluir = (): void => {
    const pendentes = items.filter((i) => i.status !== 'comprado');
    if (pendentes.length > 0) {
      navigation.navigate('CheckoutConfirm', { listaId: route.params.listaId });
    } else {
      navigation.navigate('CheckoutForm', { listaId: route.params.listaId });
    }
  };

  return (
    <View style={styles.root}>
      <TotalParcialHeader
        total={total}
        mercadoNome={mercadoNome}
        onPickMercado={() => setMercadoModalVisible(true)}
      />
      <FiltroChips selected={filters} onToggle={toggleFilter} />
      <FlatList
        data={filtered}
        keyExtractor={(it) => it.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum item</Text>}
        renderItem={({ item }) => (
          <List.Item
            title={item.produtoNome}
            description={fmtSubtitle(item) || undefined}
            onPress={() => handleRowPress(item)}
            onLongPress={() => handleLongPress(item)}
            left={() => (
              <Checkbox
                status={item.status === 'comprado' ? 'checked' : 'unchecked'}
                onPress={() => handleRowPress(item)}
              />
            )}
            accessibilityLabel={`${item.produtoNome} ${fmtSubtitle(item)}`}
            accessibilityState={{ checked: item.status === 'comprado' }}
          />
        )}
      />
      <FAB
        icon="plus"
        onPress={() => setAddModalVisible(true)}
        style={styles.fabAdd}
        accessibilityLabel="Adicionar item"
        testID="compra-add-fab"
      />
      <FAB
        icon="check"
        label="Concluir"
        onPress={handleConcluir}
        style={styles.fabConcluir}
        accessibilityLabel="Concluir compra"
        testID="concluir-compra-fab"
      />
      <MercadoPicker
        visible={mercadoModalVisible}
        onDismiss={() => setMercadoModalVisible(false)}
        onSelect={(m) => {
          setMercado(m.id);
          setMercadoModalVisible(false);
        }}
      />
      <MarcarItemSheet
        visible={editingItem !== null}
        onDismiss={() => setEditingItem(null)}
        produtoNome={editingItem?.produtoNome ?? ''}
        initialQtd={
          editingItem?.quantidadeComprada ?? editingItem?.quantidadePlanejada ?? null
        }
        initialPreco={editingItem?.precoUnitario ?? null}
        onConfirm={handleConfirmMarcar}
      />
      <AddItemEmCompraForm
        visible={addModalVisible}
        onDismiss={() => setAddModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { padding: 8 },
  empty: { textAlign: 'center', marginTop: 32 },
  fabAdd: { position: 'absolute', right: 16, bottom: 88 },
  fabConcluir: { position: 'absolute', right: 16, bottom: 16 },
});
