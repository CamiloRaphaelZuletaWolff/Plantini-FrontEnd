import React from 'react';
import { Stack } from 'expo-router';
import { useThemeColors } from '../../../../src/hooks';

export default function OportunidadesLayout() {
  const { colors } = useThemeColors();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerBackTitle: 'Volver',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Oportunidades de Voluntariado',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Detalle del Voluntariado',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
