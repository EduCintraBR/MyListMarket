import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import CheckoutStepHeader from '@/components/CheckoutStepHeader';
import { deleteIfExists, fullPath, pickFromCamera, pickFromGallery, processAndSave } from '@/lib/image';
import { log } from '@/lib/log';
import type { ListasStackParamList } from '@/navigation/types';
import { useAppStore } from '@/state';

type Props = NativeStackScreenProps<ListasStackParamList, 'CheckoutFoto'>;

export default function CheckoutFotoScreen({ route, navigation }: Props): JSX.Element {
  const { listaId } = route.params;
  const fotoPath = useAppStore((s) => s.draftFotoCupomPath);
  const setFotoPath = useAppStore((s) => s.setDraftFotoCupomPath);

  const handlePick = async (source: 'camera' | 'gallery'): Promise<void> => {
    try {
      const res =
        source === 'camera' ? await pickFromCamera() : await pickFromGallery();
      if (res.canceled) return;
      const rel = await processAndSave(res.uri);
      if (fotoPath) await deleteIfExists(fotoPath);
      setFotoPath(rel);
    } catch (e) {
      log.error('[CheckoutFoto] pick failed', e);
    }
  };

  const handleRemove = async (): Promise<void> => {
    if (fotoPath) await deleteIfExists(fotoPath);
    setFotoPath(null);
  };

  return (
    <View style={styles.root}>
      <CheckoutStepHeader step={3} label="Foto do cupom" />
      <Text variant="titleMedium" accessibilityRole="header">
        Foto do cupom (opcional)
      </Text>

      {fotoPath ? (
        <Image source={{ uri: fullPath(fotoPath) }} style={styles.preview} resizeMode="contain" />
      ) : (
        <View style={styles.placeholder}>
          <Text>Sem foto</Text>
        </View>
      )}

      <Button mode="contained-tonal" onPress={() => void handlePick('camera')} testID="foto-camera">
        Tirar foto
      </Button>
      <Button mode="contained-tonal" onPress={() => void handlePick('gallery')} testID="foto-gallery">
        Escolher da galeria
      </Button>
      {fotoPath ? (
        <Button onPress={() => void handleRemove()} testID="foto-remove">
          Remover foto
        </Button>
      ) : null}

      <View style={styles.gap} />
      <Button
        mode="contained"
        onPress={() => navigation.navigate('CheckoutResumo', { listaId })}
        testID="foto-continue"
      >
        Continuar
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, gap: 12 },
  preview: { height: 240, width: '100%', backgroundColor: '#f0f0f0' },
  placeholder: { height: 240, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' },
  gap: { height: 16 },
});
