// Cupom photo helpers: pick + resize + persist under documentDirectory.
// PRD §11 / Constitution C-1 (offline-first): no network, files stored locally only.

import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import { newId } from '@/lib/id';

export type PickResult = { canceled: true } | { canceled: false; uri: string };

const CUPONS_DIR_NAME = 'cupons';

const cuponsDir = (): string => `${FileSystem.documentDirectory}${CUPONS_DIR_NAME}/`;

export const pickFromCamera = async (): Promise<PickResult> => {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return { canceled: true };
  const r = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 1,
    exif: false,
  });
  if (r.canceled || r.assets.length === 0) return { canceled: true };
  return { canceled: false, uri: r.assets[0]?.uri ?? '' };
};

export const pickFromGallery = async (): Promise<PickResult> => {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return { canceled: true };
  const r = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 1,
  });
  if (r.canceled || r.assets.length === 0) return { canceled: true };
  return { canceled: false, uri: r.assets[0]?.uri ?? '' };
};

export const processAndSave = async (sourceUri: string): Promise<string> => {
  const manipulated = await ImageManipulator.manipulateAsync(
    sourceUri,
    [{ resize: { width: 1600 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
  );
  await FileSystem.makeDirectoryAsync(cuponsDir(), { intermediates: true });
  const filename = `${newId()}.jpg`;
  const dest = `${cuponsDir()}${filename}`;
  await FileSystem.moveAsync({ from: manipulated.uri, to: dest });
  return `${CUPONS_DIR_NAME}/${filename}`;
};

export const deleteIfExists = async (relativePath: string): Promise<void> => {
  const full = `${FileSystem.documentDirectory}${relativePath}`;
  const info = await FileSystem.getInfoAsync(full);
  if (info.exists) {
    await FileSystem.deleteAsync(full, { idempotent: true });
  }
};

export const fullPath = (relativePath: string): string =>
  `${FileSystem.documentDirectory}${relativePath}`;
