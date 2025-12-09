import { Tabs } from 'expo-router';
import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Home01Icon,
  Calendar03Icon,
  GridIcon,
  Settings02Icon,
} from '@hugeicons/core-free-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#005357',
          borderTopWidth: 1,
          borderTopColor: '#005357',
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderBottomWidth: 1,
          borderLeftColor: '#005357',
          borderRightColor: '#005357',
          borderBottomColor: '#005357',
          borderRadius: 24,
          elevation: 0,
          shadowOpacity: 0,
          height: 65,
          paddingBottom: 12,
          paddingTop: 8,
          paddingLeft: 20,
          paddingRight: 20,
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <HugeiconsIcon icon={Home01Icon} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, focused }) => (
            <HugeiconsIcon icon={Calendar03Icon} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: 'Tools',
          tabBarIcon: ({ color, focused }) => (
            <HugeiconsIcon icon={GridIcon} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <HugeiconsIcon icon={Settings02Icon} size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
