import { ImagePickerResponse } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';

export const media = {
  async uploadImage(image: ImagePickerResponse, path: string): Promise<string> {
    if (!image.assets?.[0]?.uri) {
      throw new Error('No image selected');
    }

    const reference = storage().ref(path);
    await reference.putFile(image.assets[0].uri);
    return await reference.getDownloadURL();
  },

  async deleteImage(url: string): Promise<void> {
    const reference = storage().refFromURL(url);
    await reference.delete();
  },

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  isImageFile(filename: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  },
}; 