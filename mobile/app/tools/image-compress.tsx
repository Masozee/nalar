import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon, Archive01Icon, Upload01Icon, Download01Icon } from '@hugeicons/core-free-icons';
import { compressImage } from '@/lib/api/tools';

export default function ImageCompressScreen() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{ originalSize: number; compressedSize: number } | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setCompressedImage(null);
      setStats(null);
    }
  };

  const handleCompress = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    setLoading(true);
    try {
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(selectedImage);
      const originalSize = fileInfo.exists ? fileInfo.size || 0 : 0;

      // Create FormData
      const formData = new FormData();
      const filename = selectedImage.split('/').pop() || 'image.jpg';

      formData.append('image', {
        uri: selectedImage,
        type: 'image/jpeg',
        name: filename,
      } as any);

      formData.append('quality', '80');
      formData.append('output_format', 'jpeg');

      const blob = await compressImage(formData);

      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCompressedImage(base64);
        setStats({
          originalSize,
          compressedSize: blob.size,
        });
      };
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to compress image');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!compressedImage) return;

    try {
      const filename = FileSystem.documentDirectory + 'compressed_image.jpg';
      await FileSystem.writeAsStringAsync(filename, compressedImage.split(',')[1], {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filename);
      } else {
        Alert.alert('Success', 'Image saved');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save image');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const compressionRatio = stats
    ? Math.round((1 - stats.compressedSize / stats.originalSize) * 100)
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Image Compress</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <HugeiconsIcon icon={Archive01Icon} size={48} color="#005357" />
        </View>

        <Text style={styles.description}>
          Reduce image file size without losing quality
        </Text>

        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
          <HugeiconsIcon icon={Upload01Icon} size={24} color="#005357" />
          <Text style={styles.uploadText}>Select Image</Text>
        </TouchableOpacity>

        {selectedImage && (
          <View style={styles.imageCard}>
            <Text style={styles.cardLabel}>Original Image</Text>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleCompress}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Compress Image</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {compressedImage && stats && (
          <View style={styles.resultCard}>
            <Text style={styles.cardLabel}>Compressed Image</Text>
            <Image source={{ uri: compressedImage }} style={styles.previewImage} />

            <View style={styles.statsContainer}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Original Size:</Text>
                <Text style={styles.statValue}>{formatBytes(stats.originalSize)}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Compressed Size:</Text>
                <Text style={styles.statValue}>{formatBytes(stats.compressedSize)}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Saved:</Text>
                <Text style={[styles.statValue, styles.statHighlight]}>
                  {compressionRatio}%
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
              <HugeiconsIcon icon={Download01Icon} size={20} color="#005357" />
              <Text style={styles.downloadText}>Download Image</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    gap: 12,
    marginBottom: 20,
  },
  uploadText: {
    color: '#005357',
    fontSize: 16,
    fontWeight: '600',
  },
  imageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#005357',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  statHighlight: {
    color: '#005357',
    fontWeight: '600',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  downloadText: {
    color: '#005357',
    fontSize: 14,
    fontWeight: '600',
  },
});
