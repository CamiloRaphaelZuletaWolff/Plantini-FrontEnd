import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Onboarding from 'react-native-onboarding-swiper';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ONBOARDING_STEPS } from '../src/config/onboardingSteps';
import { useThemeColors } from '../src/hooks';

const ONBOARDING_FLAG_KEY = '@voluntariado/onboarding_completed';

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useThemeColors();

  const finish = useCallback(async () => {
    // Persist completion so the entry redirect skips onboarding next launch.
    await AsyncStorage.setItem(ONBOARDING_FLAG_KEY, 'true');
    router.replace('/(auth)/login');
  }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      <Onboarding
        pages={ONBOARDING_STEPS.map((step) => ({
          backgroundColor: step.backgroundColor,
          image: <View style={{ marginVertical: 10 }}>{step.image}</View>,
          title: step.title,
          subtitle: step.subtitle,
          titleStyles: {
            fontSize: 26,
            fontWeight: '700',
            color: colors.text,
            textAlign: 'center',
            paddingHorizontal: 20,
            marginBottom: 10,
          },
          subTitleStyles: {
            fontSize: 16,
            color: colors.subtitle,
            textAlign: 'center',
            lineHeight: 24,
            paddingHorizontal: 30,
          },
        }))}
        skipLabel="Saltar"
        nextLabel="Siguiente"
        doneLabel="¡Empezar!"
        showSkip
        showNext
        showDone
        bottomBarHighlight={false}
        containerStyles={{
          flex: 1,
          paddingHorizontal: 20,
          paddingBottom: 20,
        }}
        controlStatusBar={false}
        transitionAnimationDuration={0}
        DotComponent={({ selected }: { selected: boolean }) => (
          <View
            style={{
              width: selected ? 24 : 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: selected ? colors.primary : '#D1D5DB',
              marginHorizontal: 4,
            }}
          />
        )}
        onSkip={finish}
        onDone={finish}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
