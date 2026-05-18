import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

export default function LogoutScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/(drawer)/(tabs)');
  }, []);

  return <View style={{ flex: 1 }} />;
}
