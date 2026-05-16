import { StyleSheet, View } from 'react-native';
import { List, TextInput } from 'react-native-paper';

import type { Produto } from '@/db/repos/produtoRepo';

type Props = {
  value: string;
  onChangeText: (v: string) => void;
  suggestions: Produto[];
  onSelect: (p: Produto) => void;
  label?: string;
  maxVisible?: number;
};

export default function ProdutoAutoComplete({
  value,
  onChangeText,
  suggestions,
  onSelect,
  label = 'Produto',
  maxVisible = 8,
}: Props): JSX.Element {
  const visible = value.trim().length > 0 && suggestions.length > 0;
  const shown = suggestions.slice(0, maxVisible);

  return (
    <View>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        mode="outlined"
        autoCorrect={false}
        autoCapitalize="words"
        testID="produto-autocomplete-input"
        accessibilityLabel={label}
      />
      {visible ? (
        <View style={styles.suggestions} accessibilityLiveRegion="polite">
          {shown.map((p) => (
            <List.Item
              key={p.id}
              title={p.nome}
              description={[p.marcaPadrao, p.modeloPadrao].filter(Boolean).join(' · ') || undefined}
              onPress={() => onSelect(p)}
              accessibilityRole="button"
              accessibilityLabel={`Selecionar ${p.nome}`}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  suggestions: { marginTop: 4 },
});
