import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { COLORS } from '@/utils/colors';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.background,
    border: COLORS.secondaryText,
    card: COLORS.background,
    primary: COLORS.primaryText,
    text: COLORS.primaryText,
  },
};

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync("visible").catch(() => {});
    }
  }, []);

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="now-playing"
          options={{
            headerStyle: { backgroundColor: COLORS.background },
            headerTintColor: COLORS.primaryText,
            title: 'Now Playing',
          }}
        />
        <Stack.Screen
          name="liked"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="albums"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="album-detail"
          options={{ headerShown: false }}
        />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
