import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Notification02Icon } from '@hugeicons/core-free-icons';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export default function AppHeader({ title, subtitle }: AppHeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleNotificationPress = () => {
    // TODO: Navigate to notifications page or show notification panel
    console.log('Notifications pressed');
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
          <Text style={styles.dashboardTitle}>{title}</Text>
          {subtitle && (
            <Text style={styles.dashboardSubtitle}>{subtitle}</Text>
          )}
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={handleNotificationPress}
            style={styles.notificationButton}
          >
            <HugeiconsIcon icon={Notification02Icon} size={24} color="#111827" />
            {/* Notification badge - uncomment when you have unread count */}
            {/* <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View> */}
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {user?.first_name?.[0] || user?.username?.[0] || 'U'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  dashboardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#005357',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
