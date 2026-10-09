import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/HapticTab';
import { colors } from '@/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.faint,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'swap-horizontal' : 'swap-horizontal-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: 'Budgets',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'pie-chart' : 'pie-chart-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="recurring"
        options={{
          title: 'Recurring',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'repeat' : 'repeat-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
