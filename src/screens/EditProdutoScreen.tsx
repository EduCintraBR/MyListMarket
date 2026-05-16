import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, SegmentedButtons, TextInput } from 'react-native-paper';

import type { UnidadeMedida } from '@/lib/domain';
import type { ConfigStackParamList } from '@/navigation/types';
import { useAppStore } from '@/state';

type Props = NativeStackScreenProps<ConfigStackParamList, 'EditProduto'>;

const UNIDADES: { value: UnidadeMedida; label: string }[] = [
  { value: 'un', label: 'un' },
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'L', label: 'L' },
  { value: 'mL', label: 'mL' },
  { value: 'pct', label: 'pct' },
  { value: 'cx', label: 'cx' },
];

export default function EditProdutoScreen({ route, navigation }: Props): JSX.Element {
  const produtoId = route.params?.produtoId;
  const existing = useAppStore((s) => s.produtos.find((p) => p.id === produtoId));
  const getOrCreate = useAppStore((s) => s.getOrCreateProduto);
  const updateProduto = useAppStore((s) => s.updateProduto);

  const [nome, setNome] = useState(existing?.nome ?? '');
  const [marca, setMarca] = useState(existing?.marcaPadrao ?? '');
  const [modelo, setModelo] = useState(existing?.modeloPadrao ?? '');
  const [unidade, setUnidade] = useState<UnidadeMedida | ''>(existing?.unidadePadrao ?? '');

  const save = (): void => {
    if (nome.trim().length === 0) return;
    if (existing) {
      updateProduto(existing.id, {
        nome: nome.trim(),
        marcaPadrao: marca.trim() || null,
        modeloPadrao: modelo.trim() || null,
        unidadePadrao: unidade || null,
      });
    } else {
      const p = getOrCreate(nome);
      updateProduto(p.id, {
        marcaPadrao: marca.trim() || null,
        modeloPadrao: modelo.trim() || null,
        unidadePadrao: unidade || null,
      });
    }
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <TextInput label="Nome" value={nome} onChangeText={setNome} mode="outlined" />
      <View style={styles.gap} />
      <TextInput label="Marca padrão" value={marca} onChangeText={setMarca} mode="outlined" />
      <View style={styles.gap} />
      <TextInput label="Modelo padrão" value={modelo} onChangeText={setModelo} mode="outlined" />
      <View style={styles.gap} />
      <SegmentedButtons
        value={unidade}
        onValueChange={(v) => setUnidade(v as UnidadeMedida | '')}
        buttons={UNIDADES.map((u) => ({ value: u.value, label: u.label }))}
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
