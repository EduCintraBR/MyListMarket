import { StyleSheet, View } from 'react-native';
import { ProgressBar, Text, useTheme } from 'react-native-paper';

export type CheckoutStep = 1 | 2 | 3 | 4 | 5;

type Props = {
  step: CheckoutStep;
  label: string;
};

const TOTAL_STEPS = 5;

export default function CheckoutStepHeader({ step, label }: Props): JSX.Element {
  const theme = useTheme();
  const progress = step / TOTAL_STEPS;
  const announcement = `Etapa ${step} de ${TOTAL_STEPS}: ${label}`;

  return (
    <View
      style={styles.root}
      accessibilityLiveRegion="polite"
      accessible
      accessibilityLabel={announcement}
      testID={`checkout-step-${step}`}
    >
      <Text variant="labelMedium" style={[styles.counter, { color: theme.colors.onSurfaceVariant }]}>
        {`Etapa ${step} de ${TOTAL_STEPS}`}
      </Text>
      <Text variant="titleMedium" accessibilityRole="header">
        {label}
      </Text>
      <ProgressBar progress={progress} style={styles.bar} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, gap: 4 },
  counter: { textTransform: 'uppercase', letterSpacing: 0.5 },
  bar: { marginTop: 8, height: 4, borderRadius: 2 },
});
