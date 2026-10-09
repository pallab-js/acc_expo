import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useStore } from '@/store/useStore';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const hydrate = useStore((state) => state.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <ErrorBoundary>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="transaction/[id]" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="budget/[id]" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="recurring/[id]" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="settings" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
      <StatusBar style="dark" />
    </ErrorBoundary>
  );
}
