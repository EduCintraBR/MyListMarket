import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Modal, Portal, Text, TextInput } from 'react-native-paper';

import ProdutoAutoComplete from '@/components/ProdutoAutoComplete';
import type { Produto } from '@/db/repos/produtoRepo';
import { normalizeText } from '@/lib/textNormalize';
import { useAppStore } from '@/state';

const parseNum = (raw: string): number | null => {
  const cleaned = raw.replace(',', '.').trim();
  if (cleaned.length === 0) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};

type Props = {
  visible: boolean;
  onDismiss: () => void;
};

export default function AddItemEmCompraForm({ visible, onDismiss }: Props): JSX.Element {
  const produtos = useAppStore((s) => s.produtos);
  const adicionar = useAppStore((s) => s.adicionarUnplannedCompra);

  const [nome, setNome] = useState('');
  const [qtd, setQtd] = useState('');
  const [preco, setPreco] = useState('');
  const [marca, setMarca] = useState('');

  const suggestions = useMemo(() => {
    const q = normalizeText(nome);
    if (q.length === 0) return [];
    return produtos.filter((p) => normalizeText(p.nome).includes(q)).slice(0, 8);
  }, [nome, produtos]);

  const qtdNum = parseNum(qtd);
  const precoNum = parseNum(preco);
  const canSubmit =
    nome.trim().length > 0 && qtdNum != null && qtdNum > 0 && precoNum != null && precoNum >= 0;

  const reset = (): void => {
    setNome('');
    setQtd('');
    setPreco('');
    setMarca('');
  };

  const handleSelectSuggestion = (p: Produto): void => {
    setNome(p.nome);
    if (p.marcaPadrao) setMarca(p.marcaPadrao);
  };

  const handleAdd = (): void => {
    if (!canSubmit || qtdNum == null || precoNum == null) return;
    adicionar({
      nome: nome.trim(),
      quantidadeComprada: qtdNum,
      precoUnitario: precoNum,
      marca: marca.trim() || null,
    });
    reset();
    onDismiss();
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Text variant="titleMedium" style={styles.title}>
          Adicionar item
        </Text>
        <ProdutoAutoComplete
          value={nome}
          onChangeText={setNome}
          suggestions={suggestions}
          onSelect={handleSelectSuggestion}
        />
        <View style={styles.gap} />
        <TextInput
          mode="outlined"
          label="Quantidade"
          value={qtd}
          onChangeText={setQtd}
          keyboardType="decimal-pad"
          testID="unplanned-qtd"
        />
        <View style={styles.gap} />
        <TextInput
          mode="outlined"
          label="Preço unitário (R$)"
          value={preco}
          onChangeText={setPreco}
          keyboardType="decimal-pad"
          testID="unplanned-preco"
        />
        <View style={styles.gap} />
        <TextInput mode="outlined" label="Marca" value={marca} onChangeText={setMarca} />
        <View style={styles.gap} />
        <View style={styles.actions}>
          <Button onPress={onDismiss}>Cancelar</Button>
          <Button mode="contained" onPress={handleAdd} disabled={!canSubmit} testID="unplanned-confirm">
            Adicionar
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: { backgroundColor: 'white', margin: 16, padding: 16, borderRadius: 8 },
  title: { marginBottom: 8 },
  gap: { height: 12 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
});
