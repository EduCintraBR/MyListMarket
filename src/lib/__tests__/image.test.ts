/* eslint-disable import/first */
jest.mock('expo-image-picker', () => ({
  MediaTypeOptions: { Images: 'Images' },
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock('expo-image-manipulator', () => ({
  SaveFormat: { JPEG: 'jpeg' },
  manipulateAsync: jest.fn(),
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///doc/',
  makeDirectoryAsync: jest.fn(),
  moveAsync: jest.fn(),
  getInfoAsync: jest.fn(),
  deleteAsync: jest.fn(),
}));

import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import { deleteIfExists, pickFromCamera, pickFromGallery, processAndSave } from '@/lib/image';

const mocked = <T>(fn: T): jest.Mock => fn as unknown as jest.Mock;

describe('image lib', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('pickFromCamera returns canceled when permission denied', async () => {
    mocked(ImagePicker.requestCameraPermissionsAsync).mockResolvedValue({ granted: false });
    const r = await pickFromCamera();
    expect(r).toEqual({ canceled: true });
  });

  it('pickFromCamera returns uri when picker succeeds', async () => {
    mocked(ImagePicker.requestCameraPermissionsAsync).mockResolvedValue({ granted: true });
    mocked(ImagePicker.launchCameraAsync).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///tmp/foo.jpg' }],
    });
    const r = await pickFromCamera();
    expect(r).toEqual({ canceled: false, uri: 'file:///tmp/foo.jpg' });
  });

  it('pickFromGallery returns canceled when user cancels', async () => {
    mocked(ImagePicker.requestMediaLibraryPermissionsAsync).mockResolvedValue({ granted: true });
    mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValue({ canceled: true });
    const r = await pickFromGallery();
    expect(r).toEqual({ canceled: true });
  });

  it('processAndSave resizes to 1600, JPEG q=0.8, writes under cupons/', async () => {
    mocked(ImageManipulator.manipulateAsync).mockResolvedValue({ uri: 'file:///tmp/resized.jpg' });
    mocked(FileSystem.makeDirectoryAsync).mockResolvedValue(undefined);
    mocked(FileSystem.moveAsync).mockResolvedValue(undefined);

    const rel = await processAndSave('file:///tmp/foo.jpg');
    expect(rel).toMatch(/^cupons\/[a-f0-9-]+\.jpg$/);

    expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
      'file:///tmp/foo.jpg',
      [{ resize: { width: 1600 } }],
      { compress: 0.8, format: 'jpeg' },
    );
    expect(FileSystem.makeDirectoryAsync).toHaveBeenCalledWith('file:///doc/cupons/', {
      intermediates: true,
    });
    const moveCall = mocked(FileSystem.moveAsync).mock.calls[0]?.[0];
    expect(moveCall).toEqual({
      from: 'file:///tmp/resized.jpg',
      to: expect.stringMatching(/^file:\/\/\/doc\/cupons\/[a-f0-9-]+\.jpg$/),
    });
  });

  it('deleteIfExists deletes only when file exists', async () => {
    mocked(FileSystem.getInfoAsync).mockResolvedValueOnce({ exists: true });
    mocked(FileSystem.deleteAsync).mockResolvedValue(undefined);
    await deleteIfExists('cupons/x.jpg');
    expect(FileSystem.deleteAsync).toHaveBeenCalled();

    mocked(FileSystem.getInfoAsync).mockResolvedValueOnce({ exists: false });
    mocked(FileSystem.deleteAsync).mockClear();
    await deleteIfExists('cupons/missing.jpg');
    expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
  });
});
