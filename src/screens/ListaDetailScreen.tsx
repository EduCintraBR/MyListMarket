import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useLayoutEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { Button, IconButton, List, Text, TextInput } from 'react-native-paper';

import AddItemForm from '@/components/AddItemForm';
import type { ItemListaWithProduto } from '@/db/repos/itemListaRepo';
import type { ListasStackParamList } from '@/navigation/types';
import { useAppStore } from '@/state';

type Props = NativeStackScreenProps<ListasStackParamList, 'ListaDetail'>;

const fmtQty = (item: ItemListaWithProduto): string => {
  const parts: string[] = [];
  if (item.quantidadePlanejada != null) {
    parts.push(`${item.quantidadePlanejada}${item.unidade ? ` ${item.unidade}` : ''}`);
  }
  if (item.marca) parts.push(item.marca);
  if (item.modelo) parts.push(item.modelo);
  return parts.join(' · ');
};

export default function ListaDetailScreen({ route, navigation }: Props): JSX.Element {
  const { listaId } = route.params;
  const lista = useAppStore((s) => s.listas.find((l) => l.id === listaId));
  const items = useAppStore((s) => s.itemsByLista[listaId] ?? []);
  const refreshItems = useAppStore((s) => s.refreshItems);
  const updateLista = useAppStore((s) => s.updateLista);
  const encerrarLista = useAppStore((s) => s.encerrarLista);
  const removeItem = useAppStore((s) => s.removeItem);
  const iniciarCompraAtiva = useAppStore((s) => s.iniciarCompraAtiva);
  const compraAtivaListaId = useAppStore((s) => s.compraAtivaListaId);

  const [editingNome, setEditingNome] = useState(false);
  const [nomeDraft, setNomeDraft] = useState(lista?.nome ?? '');

  useEffect(() => {
    refreshItems(listaId);
  }, [listaId, refreshItems]);

  useLayoutEffect(() => {
    navigation.setOptions({ title: lista?.nome ?? 'Lista' });
  }, [lista?.nome, navigation]);

  if (!lista) {
    return (
      <View style={styles.empty}>
        <Text>Lista não encontrada</Text>
      </View>
    );
  }

  const readonly = lista.status !== 'planejamento';

  const handleSaveNome = (): void => {
    const trimmed = nomeDraft.trim();
    if (trimmed.length === 0) {
      setEditingNome(false);
      setNomeDraft(lista.nome ?? '');
      return;
    }
    updateLista(lista.id, { nome: trimmed });
    setEditingNome(false);
  };

  const handleEncerrar = (): void => {
    Alert.alert('Encerrar lista', 'Tem certeza? Os itens serão congelados.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Encerrar',
        style: 'destructive',
        onPress: () => {
          encerrarLista(lista.id);
        },
      },
    ]);
  };

  const handleRemove = (itemId: string): void => {
    Alert.alert('Remover item', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => removeItem(listaId, itemId),
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        {editingNome ? (
          <View style={styles.editRow}>
            <TextInput
              mode="outlined"
              value={nomeDraft}
              onChangeText={setNomeDraft}
              style={styles.editInput}
              testID="lista-nome-input"
            />
            <Button onPress={handleSaveNome}>Salvar</Button>
          </View>
        ) : (
          <View style={styles.editRow}>
            <Text variant="titleLarge" style={styles.title}>
              {lista.nome}
            </Text>
            {!readonly ? (
              <IconButton
                icon="pencil"
                onPress={() => {
                  setNomeDraft(lista.nome ?? '');
                  setEditingNome(true);
                }}
                accessibilityLabel="Editar nome da lista"
              />
            ) : null}
          </View>
        )}
        {!readonly ? (
          <View style={styles.actionRow}>
            <Button
              mode="contained"
              onPress={() => {
                try {
                  iniciarCompraAtiva(lista.id);
                  navigation.navigate('CompraMode', { listaId: lista.id });
                } catch (e) {
                  const msg = e instanceof Error ? e.message : String(e);
                  Alert.alert('Não foi possível iniciar', msg);
                }
              }}
              disabled={compraAtivaListaId !== null && compraAtivaListaId !== lista.id}
              testID="iniciar-compra"
            >
              Iniciar compra
            </Button>
            <Button onPress={handleEncerrar} testID="encerrar-lista">
              Encerrar sem comprar
            </Button>
          </View>
        ) : (
          <Text accessibilityLabel="Lista somente leitura">
            Lista em modo somente leitura
          </Text>
        )}
      </View>

      {!readonly ? (
        <View style={styles.form}>
          <AddItemForm listaId={listaId} />
        </View>
      ) : null}

      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum item ainda</Text>}
        renderItem={({ item }) => (
          <List.Item
            title={item.produtoNome}
            description={fmtQty(item) || undefined}
            {...(readonly ? {} : { onLongPress: () => handleRemove(item.id) })}
            accessibilityLabel={`${item.produtoNome} ${fmtQty(item)}`}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { padding: 16, gap: 8 },
  actionRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  editRow: { flexDirection: 'row', alignItems: 'center' },
  title: { flex: 1 },
  editInput: { flex: 1 },
  form: { paddingHorizontal: 16 },
  list: { padding: 12 },
  empty: { textAlign: 'center', marginTop: 32 },
});
