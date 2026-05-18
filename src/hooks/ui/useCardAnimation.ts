import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

interface CardAnimationOptions {
  delay?: number;
  duration?: number;
  useNativeDriver?: boolean;
}

/**
 * Hook para animar la entrada de cards con fade + slide
 * @param index - Índice de la card en la lista (para stagger)
 * @param options - Opciones de configuración
 */
export const useCardAnimation = (
  index: number = 0,
  options: CardAnimationOptions = {}
) => {
  const {
    delay = index * 80,
    duration = 400,
    useNativeDriver = true,
  } = options;

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay,
        tension: 50,
        friction: 7,
        useNativeDriver,
      }),
      Animated.spring(scale, {
        toValue: 1,
        delay,
        tension: 50,
        friction: 7,
        useNativeDriver,
      }),
    ]).start();
  }, []);

  return {
    opacity,
    transform: [{ translateY }, { scale }],
  };
};

/**
 * Hook para animar el botón de favorito con bounce
 */
export const useFavoriteAnimation = () => {
  const scale = useRef(new Animated.Value(1)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  const animateFavorite = (isFavorite: boolean) => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1.3,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '15deg'],
  });

  return {
    animateFavorite,
    style: {
      transform: [{ scale }, { rotate }],
    },
  };
};

/**
 * Hook para animar el press de la card 
 */
export const useCardPressAnimation = () => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      friction: 4,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  return {
    scale,
    onPressIn,
    onPressOut,
  };
};

/**
 * Hook para animar badges de estado con pulso
 */
export const useBadgePulseAnimation = (shouldPulse: boolean = false) => {
  const pulseScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!shouldPulse) return;

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, [shouldPulse]);

  return {
    transform: [{ scale: pulseScale }],
  };
};

/**
 * Hook para feedback visual al enviar postulación
 */
export const useSubmitFeedbackAnimation = () => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const animateSubmit = (onComplete?: () => void) => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 0.9,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      onComplete?.();
    });
  };

  const resetAnimation = () => {
    scale.setValue(1);
    opacity.setValue(1);
  };

  return {
    animateSubmit,
    resetAnimation,
    style: {
      opacity,
      transform: [{ scale }],
    },
  };
};
