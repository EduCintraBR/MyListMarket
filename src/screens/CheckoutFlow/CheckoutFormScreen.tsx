import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

import CheckoutStepHeader from '@/components/CheckoutStepHeader';
import FormaPagamentoSelector from '@/components/FormaPagamentoSelector';
import MercadoPicker from '@/components/MercadoPicker';
import type { ListasStackParamList } from '@/navigation/types';
import { useAppStore } from '@/state';

type Props = NativeStackScreenProps<ListasStackParamList, 'CheckoutForm'>;

const parseNum = (raw: string): number | null => {
  const cleaned = raw.replace(',', '.').trim();
  if (cleaned.length === 0) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) && n > 0 ? n : null;
};

export default function CheckoutFormScreen({ route, navigation }: Props): JSX.Element {
  const { listaId } = route.params;
  const mercadoId = useAppStore((s) => s.draftMercadoId);
  const mercadoNome = useAppStore(
    (s) => s.mercados.find((m) => m.id === mercadoId)?.nome ?? null,
  );
  const formaPagamento = useAppStore((s) => s.draftFormaPagamento);
  const setMercado = useAppStore((s) => s.setDraftMercado);
  const setForma = useAppStore((s) => s.setDraftFormaPagamento);
  const setTotalReal = useAppStore((s) => s.setDraftTotalReal);
  const draftTotalReal = useAppStore((s) => s.draftTotalReal);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [totalRealInput, setTotalRealInput] = useState(
    draftTotalReal != null ? String(draftTotalReal) : '',
  );

  const canContinue = mercadoId != null && formaPagamento != null;

  const handleContinue = (): void => {
    if (!canContinue) return;
    setTotalReal(parseNum(totalRealInput));
    navigation.navigate('CheckoutFoto', { listaId });
  };

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <CheckoutStepHeader step={2} label="Mercado e pagamento" />
      <Text variant="titleMedium" accessibilityRole="header">
        Mercado
      </Text>
      <Button
        mode={mercadoNome ? 'outlined' : 'contained-tonal'}
        onPress={() => setPickerOpen(true)}
        testID="checkout-pick-mercado"
      >
        {mercadoNome ?? 'Escolher mercado'}
      </Button>

      <View style={styles.gap} />
      <Text variant="titleMedium" accessibilityRole="header">
        Forma de pagamento
      </Text>
      <FormaPagamentoSelector value={formaPagamento} onChange={setForma} />

      <View style={styles.gap} />
      <Text variant="titleMedium" accessibilityRole="header">
        Total real (opcional)
      </Text>
      <TextInput
        mode="outlined"
        label="R$"
        keyboardType="decimal-pad"
        value={totalRealInput}
        onChangeText={setTotalRealInput}
        testID="checkout-total-real"
      />

      <View style={styles.gap} />
      <Button
        mode="contained"
        onPress={handleContinue}
        disabled={!canContinue}
        testID="checkout-form-continue"
      >
        Continuar
      </Button>

      <MercadoPicker
        visible={pickerOpen}
        onDismiss={() => setPickerOpen(false)}
        onSelect={(m) => {
          setMercado(m.id);
          setPickerOpen(false);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { padding: 16, gap: 8 },
  gap: { height: 16 },
});
