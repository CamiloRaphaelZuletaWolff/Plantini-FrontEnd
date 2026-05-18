import React from 'react';
import { Stack } from 'expo-router';

import { useThemeColors } from '../../../../src/hooks';

export default function MapLayout() {
  const { colors } = useThemeColors();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Ruta',
          headerBackTitle: 'Volver',
        }}
      />
    </Stack>
  );
}
