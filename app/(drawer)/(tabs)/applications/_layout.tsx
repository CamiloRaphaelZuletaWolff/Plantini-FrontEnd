import React from 'react';
import { Stack } from 'expo-router';

import { useThemeColors } from '../../../../src/hooks';

const ApplicationsLayout = () => {
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
    <Stack.Screen name="index" options={{ title: 'Mis Postulaciones', headerShown: false }} />
    </Stack>
);
};

export default ApplicationsLayout;