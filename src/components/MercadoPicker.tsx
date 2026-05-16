import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Divider, List, Modal, Portal, Text, TextInput } from 'react-native-paper';

import type { Mercado } from '@/db/repos/mercadoRepo';
import { normalizeText } from '@/lib/textNormalize';
import { useAppStore } from '@/state';

type Props = {
  visible: boolean;
  onDismiss: () => void;
  onSelect: (mercado: Mercado) => void;
};

export default function MercadoPicker({ visible, onDismiss, onSelect }: Props): JSX.Element {
  const mercados = useAppStore((s) => s.mercados);
  const create = useAppStore((s) => s.createMercado);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = normalizeText(query);
    const active = mercados.filter((m) => m.excluidoEm === null);
    if (q.length === 0) return active;
    return active.filter((m) => normalizeText(m.nome).includes(q));
  }, [mercados, query]);

  const exactMatch = filtered.some((m) => normalizeText(m.nome) === normalizeText(query));
  const showCreateOption = query.trim().length > 0 && !exactMatch;

  const handleCreate = (): void => {
    const m = create({ nome: query.trim() });
    setQuery('');
    onSelect(m);
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Text variant="titleMedium" style={styles.title}>
          Escolher mercado
        </Text>
        <TextInput
          mode="outlined"
          label="Buscar ou criar"
          value={query}
          onChangeText={setQuery}
          testID="mercado-picker-input"
          autoFocus
        />
        <ScrollView style={styles.list}>
          {showCreateOption ? (
            <List.Item
              title={`+ Criar "${query.trim()}"`}
              onPress={handleCreate}
              accessibilityRole="button"
            />
          ) : null}
          {filtered.map((m) => (
            <View key={m.id}>
              <List.Item
                title={m.nome}
                description={m.observacoes ?? undefined}
                onPress={() => onSelect(m)}
              />
              <Divider />
            </View>
          ))}
          {filtered.length === 0 && !showCreateOption ? (
            <Text style={styles.empty}>Nenhum mercado</Text>
          ) : null}
        </ScrollView>
        <Button onPress={onDismiss}>Cancelar</Button>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: { backgroundColor: 'white', margin: 16, padding: 16, borderRadius: 8 },
  title: { marginBottom: 8 },
  list: { maxHeight: 320, marginTop: 8 },
  empty: { textAlign: 'center', padding: 16 },
});
