import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';

import type { ConfigStackParamList } from '@/navigation/types';
import { useAppStore } from '@/state';

type Props = NativeStackScreenProps<ConfigStackParamList, 'EditMercado'>;

export default function EditMercadoScreen({ route, navigation }: Props): JSX.Element {
  const mercadoId = route.params?.mercadoId;
  const existing = useAppStore((s) => s.mercados.find((m) => m.id === mercadoId));
  const create = useAppStore((s) => s.createMercado);
  const update = useAppStore((s) => s.updateMercado);

  const [nome, setNome] = useState(existing?.nome ?? '');
  const [obs, setObs] = useState(existing?.observacoes ?? '');

  const save = (): void => {
    if (nome.trim().length === 0) return;
    if (existing) {
      update(existing.id, { nome: nome.trim(), observacoes: obs.trim() || null });
    } else {
      create({ nome: nome.trim(), observacoes: obs.trim() || null });
    }
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <TextInput label="Nome" value={nome} onChangeText={setNome} mode="outlined" />
      <View style={styles.gap} />
      <TextInput
        label="Observações"
        value={obs}
        onChangeText={setObs}
        mode="outlined"
        multiline
        numberOfLines={3}
      />
      <View style={styles.gap} />
      <Button mode="contained" onPress={save} disabled={nome.trim().length === 0}>
        Salvar
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { padding: 16 },
  gap: { height: 12 },
});
