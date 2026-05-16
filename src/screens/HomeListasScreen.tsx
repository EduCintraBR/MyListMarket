import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Card, Chip, FAB, Text } from 'react-native-paper';

import type { ListasStackParamList } from '@/navigation/types';
import { useAppStore } from '@/state';

type Props = NativeStackScreenProps<ListasStackParamList, 'HomeListas'>;

const STATUS_LABEL: Record<string, string> = {
  planejamento: 'Planejando',
  em_compra: 'Em compra',
  finalizada: 'Finalizada',
  encerrada: 'Encerrada',
};

export default function HomeListasScreen({ navigation }: Props): JSX.Element {
  const listas = useAppStore((s) => s.listas);
  const createLista = useAppStore((s) => s.createLista);
  const compraAtivaListaId = useAppStore((s) => s.compraAtivaListaId);
  const didAutoNav = useRef(false);

  useEffect(() => {
    if (didAutoNav.current) return;
    if (compraAtivaListaId) {
      didAutoNav.current = true;
      navigation.navigate('CompraMode', { listaId: compraAtivaListaId });
    }
  }, [compraAtivaListaId, navigation]);

  const handleCreate = (): void => {
    const l = createLista({});
    navigation.navigate('ListaDetail', { listaId: l.id });
  };

  return (
    <View style={styles.root}>
      <FlatList
        data={listas}
        keyExtractor={(l) => l.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty} accessibilityLabel="Sem listas">
            Nenhuma lista. Toque em + para criar.
          </Text>
        }
        renderItem={({ item }) => (
          <Card
            style={styles.card}
            onPress={() => navigation.navigate('ListaDetail', { listaId: item.id })}
            accessibilityRole="button"
            accessibilityLabel={`Abrir ${item.nome ?? 'lista'}`}
          >
            <Card.Title
              title={item.nome ?? '(sem nome)'}
              subtitle={`${item.itemCount} ${item.itemCount === 1 ? 'item' : 'itens'}`}
              right={() => (
                <Chip compact style={styles.chip}>
                  {STATUS_LABEL[item.status] ?? item.status}
                </Chip>
              )}
            />
          </Card>
        )}
      />
      <FAB
        icon="plus"
        onPress={handleCreate}
        style={styles.fab}
        accessibilityLabel="Nova lista"
        testID="home-listas-fab"
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
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
