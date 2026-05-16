import * as ExpoConstants from 'expo-constants';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

const APP_NAME = 'MyListMarket';

const getVersion = (): string => {
  const v = ExpoConstants.default?.expoConfig?.version;
  return typeof v === 'string' && v.length > 0 ? v : '1.0.0';
};

export default function SobreScreen(): JSX.Element {
  const version = getVersion();
  return (
    <ScrollView contentContainerStyle={styles.root}>
      <Card mode="elevated" style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" accessibilityRole="header">
            {APP_NAME}
          </Text>
          <Text variant="bodyMedium" style={styles.spaced}>
            {`Versão ${version}`}
          </Text>
        </Card.Content>
      </Card>

      <Card mode="elevated" style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" accessibilityRole="header">
            Sobre
          </Text>
          <Text variant="bodyMedium" style={styles.spaced}>
            Aplicativo offline-first para planejamento de listas de compras e acompanhamento de
            gastos em supermercados. Sem cadastro, sem internet, seus dados ficam no seu aparelho.
          </Text>
        </Card.Content>
      </Card>

      <Card mode="elevated" style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" accessibilityRole="header">
            Privacidade
          </Text>
          <Text variant="bodyMedium" style={styles.spaced}>
            Nenhum dado é enviado para servidores externos. Fotos de cupom e histórico ficam
            armazenados localmente.
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.footer}>
        <Text variant="bodySmall" style={styles.muted}>
          © {new Date().getFullYear()} {APP_NAME}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { padding: 16, gap: 12 },
  card: { marginVertical: 4 },
  spaced: { marginTop: 8 },
  footer: { alignItems: 'center', paddingVertical: 16 },
  muted: { opacity: 0.6 },
});
