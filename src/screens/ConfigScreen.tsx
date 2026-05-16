import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Divider, List, RadioButton, Text } from 'react-native-paper';

import type { ConfigStackParamList } from '@/navigation/types';
import { useAppStore } from '@/state';
import type { ThemeMode } from '@/state/slices/settings';

type Nav = NativeStackNavigationProp<ConfigStackParamList, 'ConfigHome'>;

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'system', label: 'Seguir o sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
];

export default function ConfigScreen(): JSX.Element {
  const nav = useNavigation<Nav>();
  const themeMode = useAppStore((s) => s.themeMode);
  const setThemeMode = useAppStore((s) => s.setThemeMode);
  const settingsReady = useAppStore((s) => s.settingsReady);

  return (
    <ScrollView style={styles.root}>
      <List.Section>
        <List.Subheader>Aparência</List.Subheader>
        <RadioButton.Group
          onValueChange={(v) => {
            if (settingsReady) setThemeMode(v as ThemeMode);
          }}
          value={themeMode}
        >
          {THEME_OPTIONS.map((opt) => (
            <RadioButton.Item
              key={opt.value}
              label={opt.label}
              value={opt.value}
              testID={`theme-${opt.value}`}
            />
          ))}
        </RadioButton.Group>
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Dados</List.Subheader>
        <List.Item
          title="Catálogo"
          description="Produtos cadastrados implicitamente"
          left={(p) => <List.Icon {...p} icon="cart-outline" />}
          onPress={() => nav.navigate('Catalogo')}
        />
        <List.Item
          title="Mercados"
          description="Locais onde você compra"
          left={(p) => <List.Icon {...p} icon="store-outline" />}
          onPress={() => nav.navigate('Mercados')}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Em breve</List.Subheader>
        <List.Item
          title="Exportar CSV/PDF"
          description="Disponível em uma próxima versão"
          left={(p) => <List.Icon {...p} icon="file-export-outline" />}
          disabled
        />
        <List.Item
          title="Backup do banco"
          description="Disponível em uma próxima versão"
          left={(p) => <List.Icon {...p} icon="cloud-upload-outline" />}
          disabled
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Item
          title="Sobre"
          left={(p) => <List.Icon {...p} icon="information-outline" />}
          onPress={() => nav.navigate('Sobre')}
        />
      </List.Section>

      <View style={styles.footer}>
        <Text variant="bodySmall" style={styles.muted}>
          Dados ficam apenas neste dispositivo.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  footer: { padding: 16, alignItems: 'center' },
  muted: { opacity: 0.6 },
});
