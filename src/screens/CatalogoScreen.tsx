import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { Divider, FAB, List, Searchbar, Text } from 'react-native-paper';

import { normalizeText } from '@/lib/textNormalize';
import type { ConfigStackParamList } from '@/navigation/types';
import { useAppStore } from '@/state';

type Props = NativeStackScreenProps<ConfigStackParamList, 'Catalogo'>;

export default function CatalogoScreen({ navigation }: Props): JSX.Element {
  const produtos = useAppStore((s) => s.produtos);
  const archive = useAppStore((s) => s.archiveProduto);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = normalizeText(query);
    if (q.length === 0) return produtos;
    return produtos.filter((p) => normalizeText(p.nome).includes(q));
  }, [produtos, query]);

  const confirmDelete = (id: string, nome: string): void => {
    Alert.alert('Excluir produto', `Arquivar "${nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Arquivar', style: 'destructive', onPress: () => archive(id) },
    ]);
  };

  return (
    <View style={styles.root}>
      <Searchbar value={query} onChangeText={setQuery} placeholder="Buscar produto" />
      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        ItemSeparatorComponent={Divider}
        ListEmptyComponent={<Text style={styles.empty}>Catálogo vazio</Text>}
        renderItem={({ item }) => (
          <List.Item
            title={item.nome}
            description={[item.marcaPadrao, item.modeloPadrao].filter(Boolean).join(' · ')}
            right={(p) => <List.Icon {...p} icon="pencil" />}
            onPress={() => navigation.navigate('EditProduto', { produtoId: item.id })}
            onLongPress={() => confirmDelete(item.id, item.nome)}
          />
        )}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('EditProduto', {})}
        accessibilityLabel="Novo produto"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  empty: { textAlign: 'center', marginTop: 32 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
