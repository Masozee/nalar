import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AppHeader from '@/components/AppHeader';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Image01Icon,
  Download01Icon,
  QrCodeIcon,
  Link01Icon,
  Archive01Icon,
  ArrowShrinkIcon,
  CropIcon,
  Resize01Icon,
  GridIcon,
  File02Icon,
  PencilEdit01Icon,
  TextIcon,
  FileSearchIcon,
  YoutubeIcon,
  InstagramIcon,
  TwitterIcon,
} from '@hugeicons/core-free-icons';

interface Tool {
  id: string;
  name: string;
  icon: any;
}

interface ToolCategory {
  title: string;
  tools: Tool[];
}

const toolCategories: ToolCategory[] = [
  {
    title: 'Image Tools',
    tools: [
      { id: 'compress-image', name: 'Compress', icon: Archive01Icon },
      { id: 'convert-image', name: 'Convert', icon: ArrowShrinkIcon },
      { id: 'crop-image', name: 'Crop', icon: CropIcon },
      { id: 'resize-image', name: 'Resize', icon: Resize01Icon },
      { id: 'bw-image', name: 'Black & White', icon: Image01Icon },
      { id: 'pixelate-image', name: 'Pixelate', icon: GridIcon },
    ],
  },
  {
    title: 'PDF Tools',
    tools: [
      { id: 'compress-pdf', name: 'Compress', icon: Archive01Icon },
      { id: 'merge-pdf', name: 'Merge', icon: File02Icon },
      { id: 'split-pdf', name: 'Split', icon: File02Icon },
      { id: 'sign-pdf', name: 'Sign', icon: PencilEdit01Icon },
      { id: 'watermark-pdf', name: 'Watermark', icon: TextIcon },
      { id: 'docx-to-pdf', name: 'DOCX to PDF', icon: File02Icon },
      { id: 'audit-pdf', name: 'Audit', icon: FileSearchIcon },
    ],
  },
  {
    title: 'Downloader',
    tools: [
      { id: 'youtube-dl', name: 'YouTube', icon: YoutubeIcon },
      { id: 'instagram-dl', name: 'Instagram', icon: InstagramIcon },
      { id: 'twitter-dl', name: 'Twitter', icon: TwitterIcon },
    ],
  },
  {
    title: 'Other Tools',
    tools: [
      { id: 'qr-generator', name: 'QR Generator', icon: QrCodeIcon },
      { id: 'url-shortener', name: 'URL Shortener', icon: Link01Icon },
    ],
  },
];

export default function ToolsScreen() {
  const router = useRouter();

  const handleToolPress = (toolId: string) => {
    const toolRoutes: { [key: string]: string } = {
      'url-shortener': '/tools/url-shortener',
      'qr-generator': '/tools/qr-generator',
      'compress-image': '/tools/image-compress',
      'youtube-dl': '/tools/youtube-downloader',
    };

    if (toolRoutes[toolId]) {
      router.push(toolRoutes[toolId] as any);
    } else {
      Alert.alert('Coming Soon', 'This tool is under development');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="Tools"
        subtitle="Productivity tools for your daily tasks"
      />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {toolCategories.map((category, categoryIndex) => (
          <View key={categoryIndex} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category.title}</Text>
            <View style={styles.toolsGrid}>
              {category.tools.map((tool, toolIndex) => (
                <TouchableOpacity
                  key={tool.id}
                  style={styles.toolCard}
                  onPress={() => handleToolPress(tool.id)}
                >
                  <View style={styles.toolIconContainer}>
                    <HugeiconsIcon icon={tool.icon} size={32} color="#005357" />
                  </View>
                  <Text style={styles.toolName}>{tool.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  categorySection: {
    marginBottom: 32,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toolCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '31%',
    alignItems: 'center',
  },
  toolIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  toolName: {
    fontSize: 12,
    color: '#111827',
    textAlign: 'center',
    fontWeight: '500',
  },
});
