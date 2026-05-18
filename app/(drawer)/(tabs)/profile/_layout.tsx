import React from 'react';
import { Stack } from 'expo-router';

import { useThemeColors } from '../../../../src/hooks';

const ProfileLayout = () => {
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
    <Stack.Screen name="index" options={{ title: 'Perfil', headerShown: false }} />
    </Stack>
);
};

export default ProfileLayout;