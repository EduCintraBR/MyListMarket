import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, SegmentedButtons, Text, TextInput } from 'react-native-paper';

import type { ItemListaPatch, ItemListaWithProduto } from '@/db/repos/itemListaRepo';
import type { UnidadeMedida } from '@/lib/domain';
import { useAppStore } from '@/state';

const UNIDADES: { value: UnidadeMedida; label: string }[] = [
  { value: 'un', label: 'un' },
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'L', label: 'L' },
  { value: 'mL', label: 'mL' },
  { value: 'pct', label: 'pct' },
  { value: 'cx', label: 'cx' },
];

type Props = {
  listaId: string;
  item: ItemListaWithProduto;
  onSaved?: () => void;
  onSubmit?: (patch: ItemListaPatch) => void;
};

const parseQty = (raw: string): number | null => {
  const cleaned = raw.replace(',', '.').trim();
  if (cleaned.length === 0) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) && n > 0 ? n : null;
};

export default function EditItemForm({ listaId, item, onSaved, onSubmit }: Props): JSX.Element {
  const updateItem = useAppStore((s) => s.updateItem);

  const [qtd, setQtd] = useState(
    item.quantidadePlanejada != null ? String(item.quantidadePlanejada) : '',
  );
  const [unidade, setUnidade] = useState<UnidadeMedida | ''>(
    (item.unidade as UnidadeMedida | null) ?? '',
  );
  const [marca, setMarca] = useState(item.marca ?? '');
  const [modelo, setModelo] = useState(item.modelo ?? '');

  const handleSave = (): void => {
    const patch: ItemListaPatch = {
      quantidadePlanejada: parseQty(qtd),
      marca: marca.trim() || null,
      modelo: modelo.trim() || null,
      unidade: unidade || null,
    };
    if (onSubmit) onSubmit(patch);
    else updateItem(listaId, item.id, patch);
    if (onSaved) onSaved();
  };

  return (
    <View>
      <Text variant="titleMedium" style={styles.name}>
        {item.produtoNome}
      </Text>
      <TextInput
        label="Qtd"
        value={qtd}
        onChangeText={setQtd}
        mode="outlined"
        keyboardType="decimal-pad"
        testID="edit-item-qty"
      />
      <View style={styles.gap} />
      <SegmentedButtons
        value={unidade}
        onValueChange={(v) => setUnidade(v as UnidadeMedida | '')}
        buttons={UNIDADES.map((u) => ({ value: u.value, label: u.label }))}
      />
      <View style={styles.gap} />
      <TextInput label="Marca" value={marca} onChangeText={setMarca} mode="outlined" />
      <View style={styles.gap} />
      <TextInput label="Modelo" value={modelo} onChangeText={setModelo} mode="outlined" />
      <View style={styles.gap} />
      <Button
        mode="contained"
        onPress={handleSave}
        testID="edit-item-submit"
        accessibilityLabel="Salvar alterações"
      >
        Salvar
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  name: { marginBottom: 12 },
  gap: { height: 12 },
});
