import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '@/components/AppHeader';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Settings02Icon,
  Moon02Icon,
  Notification03Icon,
  SecurityIcon,
  InformationCircleIcon,
  FaceIdIcon,
  UserIcon,
} from '@hugeicons/core-free-icons';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="Settings"
        subtitle="App preferences and options"
      />
      <ScrollView>

        {/* Profile & Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile & Security</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/profile/register-face')}
          >
            <View style={styles.menuLeft}>
              <View style={styles.menuIcon}>
                <HugeiconsIcon icon={FaceIdIcon} size={20} color="#005357" />
              </View>
              <View>
                <Text style={styles.menuText}>Face Recognition</Text>
                <Text style={styles.menuSubtext}>Register your face for attendance</Text>
              </View>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIcon}>
                <HugeiconsIcon icon={UserIcon} size={20} color="#005357" />
              </View>
              <Text style={styles.menuText}>My Profile</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIcon}>
                <HugeiconsIcon icon={Moon02Icon} size={20} color="#005357" />
              </View>
              <Text style={styles.menuText}>Dark Mode</Text>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: '#D1D5DB', true: '#80A7A9' }}
              thumbColor={darkModeEnabled ? '#005357' : '#f4f3f4'}
            />
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIcon}>
                <HugeiconsIcon icon={Notification03Icon} size={20} color="#005357" />
              </View>
              <Text style={styles.menuText}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#D1D5DB', true: '#80A7A9' }}
              thumbColor={notificationsEnabled ? '#005357' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* General */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>

          <TouchableOpacity style={styles.menuItemButton}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIcon}>
                <HugeiconsIcon icon={SecurityIcon} size={20} color="#005357" />
              </View>
              <Text style={styles.menuText}>Privacy & Security</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItemButton}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIcon}>
                <HugeiconsIcon icon={InformationCircleIcon} size={20} color="#005357" />
              </View>
              <Text style={styles.menuText}>About</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Version */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>Nalar ERP v1.0.0</Text>
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
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  menuItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  menuSubtext: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 24,
    color: '#9CA3AF',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
