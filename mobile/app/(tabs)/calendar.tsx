import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '@/components/AppHeader';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Calendar03Icon } from '@hugeicons/core-free-icons';

export default function CalendarScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="Calendar"
        subtitle="Your schedule and events"
      />
      <ScrollView>

        {/* Coming Soon */}
        <View style={styles.content}>
          <HugeiconsIcon icon={Calendar03Icon} size={64} color="#005357" />
          <Text style={styles.comingSoonTitle}>Coming Soon</Text>
          <Text style={styles.comingSoonText}>
            Calendar view with events and scheduling features
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 24,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
});
