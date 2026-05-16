import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Modal, Portal, Text, TextInput } from 'react-native-paper';

const parseNum = (raw: string): number | null => {
  const cleaned = raw.replace(',', '.').trim();
  if (cleaned.length === 0) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};

type Props = {
  visible: boolean;
  onDismiss: () => void;
  produtoNome: string;
  initialQtd: number | null;
  initialPreco: number | null;
  onConfirm: (qtd: number, preco: number) => void;
};

export default function MarcarItemSheet({
  visible,
  onDismiss,
  produtoNome,
  initialQtd,
  initialPreco,
  onConfirm,
}: Props): JSX.Element {
  const [qtd, setQtd] = useState('');
  const [preco, setPreco] = useState('');

  useEffect(() => {
    if (visible) {
      setQtd(initialQtd != null ? String(initialQtd) : '');
      setPreco(initialPreco != null ? String(initialPreco) : '');
    }
  }, [visible, initialQtd, initialPreco]);

  const qtdNum = parseNum(qtd);
  const precoNum = parseNum(preco);
  const canConfirm = qtdNum != null && qtdNum > 0 && precoNum != null && precoNum >= 0;

  const handleConfirm = (): void => {
    if (!canConfirm || qtdNum == null || precoNum == null) return;
    onConfirm(qtdNum, precoNum);
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Text variant="titleMedium" style={styles.title}>
          {produtoNome}
        </Text>
        <TextInput
          mode="outlined"
          label="Quantidade"
          value={qtd}
          onChangeText={setQtd}
          keyboardType="decimal-pad"
          testID="marcar-qtd"
        />
        <View style={styles.gap} />
        <TextInput
          mode="outlined"
          label="Preço unitário (R$)"
          value={preco}
          onChangeText={setPreco}
          keyboardType="decimal-pad"
          testID="marcar-preco"
        />
        <View style={styles.gap} />
        <View style={styles.actions}>
          <Button onPress={onDismiss}>Cancelar</Button>
          <Button
            mode="contained"
            onPress={handleConfirm}
            disabled={!canConfirm}
            testID="marcar-confirm"
          >
            Marcar
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: { backgroundColor: 'white', margin: 16, padding: 16, borderRadius: 8 },
  title: { marginBottom: 12 },
  gap: { height: 12 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
});
