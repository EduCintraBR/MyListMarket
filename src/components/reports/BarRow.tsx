import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

type Props = {
  label: string;
  value: number;
  max: number;
  formatValue?: (v: number) => string;
};

export default function BarRow({ label, value, max, formatValue }: Props): JSX.Element {
  const theme = useTheme();
  const pct = max > 0 ? Math.max(0.02, value / max) : 0;
  return (
    <View style={styles.root}>
      <View style={styles.labelRow}>
        <Text variant="bodyMedium" numberOfLines={1} style={styles.label}>
          {label}
        </Text>
        <Text variant="bodyMedium">{formatValue ? formatValue(value) : String(value)}</Text>
      </View>
      <View style={[styles.track, { backgroundColor: theme.colors.surfaceVariant }]}>
        <View
          style={[
            styles.fill,
            { width: `${pct * 100}%`, backgroundColor: theme.colors.primary },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { paddingVertical: 6, gap: 4 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { flex: 1, marginRight: 8 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
});
