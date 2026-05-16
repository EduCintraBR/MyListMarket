import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { IconButton, Modal, Portal } from 'react-native-paper';

import { fullPath } from '@/lib/image';

type Props = {
  relativePath: string | null;
};

export default function CupomViewer({ relativePath }: Props): JSX.Element | null {
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);

  if (!relativePath) return null;

  const uri = fullPath(relativePath);

  return (
    <View>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="imagebutton"
        accessibilityLabel="Ver foto do cupom"
      >
        {error ? (
          <View style={styles.placeholder} testID="cupom-missing">
            <IconButton icon="image-off" />
          </View>
        ) : (
          <Image
            source={{ uri }}
            style={styles.thumb}
            resizeMode="cover"
            onError={() => setError(true)}
          />
        )}
      </Pressable>
      <Portal>
        <Modal
          visible={open}
          onDismiss={() => setOpen(false)}
          contentContainerStyle={styles.modal}
        >
          <Pressable
            onPress={() => setOpen(false)}
            accessibilityHint="Toque para fechar"
            style={styles.full}
          >
            <Image source={{ uri }} style={styles.full} resizeMode="contain" />
          </Pressable>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  thumb: { width: 120, height: 120, borderRadius: 8, backgroundColor: '#eee' },
  placeholder: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: { flex: 1, backgroundColor: 'black' },
  full: { flex: 1, width: '100%' },
});
