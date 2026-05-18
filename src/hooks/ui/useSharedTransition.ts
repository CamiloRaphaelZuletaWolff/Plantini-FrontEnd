import { useRef, useCallback } from 'react';
import { Animated, LayoutAnimation, UIManager, Platform } from 'react-native';

// Habilitar LayoutAnimation en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * Configuraciones predefinidas de Layout Animation
 */
export const LayoutAnimations = {
  spring: {
    duration: 400,
    create: {
      type: LayoutAnimation.Types.spring,
      property: LayoutAnimation.Properties.opacity,
      springDamping: 0.7,
    },
    update: {
      type: LayoutAnimation.Types.spring,
      springDamping: 0.7,
    },
    delete: {
      type: LayoutAnimation.Types.spring,
      property: LayoutAnimation.Properties.opacity,
      springDamping: 0.7,
    },
  },
  easeInOut: {
    duration: 300,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
    },
    delete: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
  },
  linear: {
    duration: 250,
    create: {
      type: LayoutAnimation.Types.linear,
      property: LayoutAnimation.Properties.opacity,
    },
    update: {
      type: LayoutAnimation.Types.linear,
    },
  },
};

/**
 * Hook para transiciones de elementos compartidos con hero animation
 */
export const useSharedElementTransition = () => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;
  const positionY = useRef(new Animated.Value(0)).current;

  /**
   * Anima la salida del elemento (antes de navegar)
   */
  const animateOut = useCallback((onComplete?: () => void) => {
    Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete?.();
    });
  }, []);

  /**
   * Anima la entrada del elemento (después de navegar)
   */
  const animateIn = useCallback(() => {
    scaleValue.setValue(1.1);
    opacityValue.setValue(0);
    positionY.setValue(20);

    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(positionY, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  const reset = useCallback(() => {
    scaleValue.setValue(1);
    opacityValue.setValue(1);
    positionY.setValue(0);
  }, []);

  return {
    animateOut,
    animateIn,
    reset,
    sharedStyle: {
      transform: [{ scale: scaleValue }, { translateY: positionY }],
      opacity: opacityValue,
    },
  };
};

/**
 * Hook para hero animation de imágenes
 */
export const useHeroImageTransition = () => {
  const scale = useRef(new Animated.Value(1)).current;
  const borderRadius = useRef(new Animated.Value(16)).current;
  const height = useRef(new Animated.Value(180)).current;

  /**
   * Expande la imagen para ocupar toda la pantalla (hero effect)
   */
  const expand = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimations.spring);
    
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1.1,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(borderRadius, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(height, {
        toValue: 300,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  /**
   * Contrae la imagen a su tamaño original
   */
  const contract = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimations.spring);
    
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(borderRadius, {
        toValue: 16,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(height, {
        toValue: 180,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  return {
    expand,
    contract,
    heroStyle: {
      transform: [{ scale }],
      borderRadius,
      height,
    },
  };
};

/**
 * Hook para transición de navegación personalizada
 */
export const useNavigationTransition = () => {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const slideIn = useCallback(() => {
    translateX.setValue(300);
    opacity.setValue(0);

    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        friction: 9,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const slideOut = useCallback((onComplete?: () => void) => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete?.();
    });
  }, []);

  return {
    slideIn,
    slideOut,
    transitionStyle: {
      transform: [{ translateX }],
      opacity,
    },
  };
};

/**
 * Hook para fade con scale en transiciones
 */
export const useFadeScaleTransition = () => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  const fadeIn = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fadeOut = useCallback((onComplete?: () => void) => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 0.9,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete?.();
    });
  }, []);

  return {
    fadeIn,
    fadeOut,
    style: {
      opacity,
      transform: [{ scale }],
    },
  };
};

/**
 * Ejecuta una LayoutAnimation con configuración personalizada
 */
export const animateLayout = (
  config: keyof typeof LayoutAnimations = 'spring',
  callback?: () => void
) => {
  LayoutAnimation.configureNext(LayoutAnimations[config], callback);
};
