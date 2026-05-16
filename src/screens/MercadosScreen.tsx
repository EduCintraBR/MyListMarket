import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { Chip, Divider, FAB, List, Searchbar, Text } from 'react-native-paper';

import { normalizeText } from '@/lib/textNormalize';
import type { ConfigStackParamList } from '@/navigation/types';
import { useAppStore } from '@/state';

type Props = NativeStackScreenProps<ConfigStackParamList, 'Mercados'>;

export default function MercadosScreen({ navigation }: Props): JSX.Element {
  const mercados = useAppStore((s) => s.mercados);
  const archive = useAppStore((s) => s.archiveMercado);
  const restore = useAppStore((s) => s.restoreMercado);
  const [query, setQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const filtered = useMemo(() => {
    const q = normalizeText(query);
    let list = mercados;
    if (!showArchived) list = list.filter((m) => m.excluidoEm === null);
    if (q.length > 0) list = list.filter((m) => normalizeText(m.nome).includes(q));
    return list;
  }, [mercados, query, showArchived]);

  const confirmArchive = (id: string, nome: string): void => {
    Alert.alert('Arquivar mercado', `Arquivar "${nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Arquivar', style: 'destructive', onPress: () => archive(id) },
    ]);
  };

  return (
    <View style={styles.root}>
      <Searchbar value={query} onChangeText={setQuery} placeholder="Buscar mercado" />
      <View style={styles.filters}>
        <Chip selected={showArchived} onPress={() => setShowArchived((v) => !v)}>
          Mostrar arquivados
        </Chip>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(m) => m.id}
        ItemSeparatorComponent={Divider}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum mercado</Text>}
        renderItem={({ item }) => {
          const archived = item.excluidoEm !== null;
          return (
            <List.Item
              title={archived ? `${item.nome} (arquivado)` : item.nome}
              description={item.observacoes ?? undefined}
              right={(p) => <List.Icon {...p} icon={archived ? 'restore' : 'pencil'} />}
              onPress={() =>
                archived ? restore(item.id) : navigation.navigate('EditMercado', { mercadoId: item.id })
              }
              onLongPress={() => !archived && confirmArchive(item.id, item.nome)}
            />
          );
        }}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('EditMercado', {})}
        accessibilityLabel="Novo mercado"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  filters: { flexDirection: 'row', padding: 8, gap: 8 },
  empty: { textAlign: 'center', marginTop: 32 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
