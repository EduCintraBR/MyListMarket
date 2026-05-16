import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, SegmentedButtons, TextInput } from 'react-native-paper';

import ProdutoAutoComplete from '@/components/ProdutoAutoComplete';
import type { Produto } from '@/db/repos/produtoRepo';
import type { UnidadeMedida } from '@/lib/domain';
import { normalizeText } from '@/lib/textNormalize';
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
  onAdded?: () => void;
};

const parseQty = (raw: string): number | null => {
  const cleaned = raw.replace(',', '.').trim();
  if (cleaned.length === 0) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) && n > 0 ? n : null;
};

export default function AddItemForm({ listaId, onAdded }: Props): JSX.Element {
  const produtos = useAppStore((s) => s.produtos);
  const addItem = useAppStore((s) => s.addItem);

  const [nome, setNome] = useState('');
  const [qtd, setQtd] = useState('');
  const [unidade, setUnidade] = useState<UnidadeMedida | ''>('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');

  const suggestions = useMemo(() => {
    const q = normalizeText(nome);
    if (q.length === 0) return [];
    return produtos.filter((p) => normalizeText(p.nome).includes(q)).slice(0, 8);
  }, [nome, produtos]);

  const handleSelectSuggestion = (p: Produto): void => {
    setNome(p.nome);
    if (p.marcaPadrao) setMarca(p.marcaPadrao);
    if (p.modeloPadrao) setModelo(p.modeloPadrao);
    if (p.unidadePadrao) setUnidade(p.unidadePadrao);
  };

  const canSubmit = nome.trim().length > 0;

  const handleAdd = (): void => {
    if (!canSubmit) return;
    addItem(listaId, {
      nome: nome.trim(),
      quantidadePlanejada: parseQty(qtd),
      marca: marca.trim() || null,
      modelo: modelo.trim() || null,
      unidade: unidade || null,
    });
    setNome('');
    setQtd('');
    setUnidade('');
    setMarca('');
    setModelo('');
    if (onAdded) onAdded();
  };

  return (
    <View>
      <ProdutoAutoComplete
        value={nome}
        onChangeText={setNome}
        suggestions={suggestions}
        onSelect={handleSelectSuggestion}
      />
      <View style={styles.row}>
        <TextInput
          label="Qtd"
          value={qtd}
          onChangeText={setQtd}
          mode="outlined"
          keyboardType="decimal-pad"
          style={styles.qty}
          testID="add-item-qty"
        />
      </View>
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
        onPress={handleAdd}
        disabled={!canSubmit}
        testID="add-item-submit"
        accessibilityLabel="Adicionar item à lista"
      >
        Adicionar
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginTop: 8 },
  qty: { flex: 1 },
  gap: { height: 12 },
});
