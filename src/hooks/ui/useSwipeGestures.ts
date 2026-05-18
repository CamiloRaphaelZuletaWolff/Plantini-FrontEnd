import { useRef } from 'react';
import { Animated, PanResponder, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3; 
const SWIPE_OUT_DURATION = 250;

interface SwipeableCardOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onDelete?: () => void;
  enabled?: boolean;
}

/**
 * Hook para hacer swipeable una card con gestos de deslizamiento
 * @param options Configuración del swipe
 */
export const useSwipeableCard = ({
  onSwipeLeft,
  onSwipeRight,
  onDelete,
  enabled = true,
}: SwipeableCardOptions = {}) => {
  const position = useRef(new Animated.ValueXY()).current;
  const swipeDirection = useRef<'left' | 'right' | null>(null);

  const forceSwipe = (direction: 'left' | 'right') => {
    const x = direction === 'right' ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
    
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: true,
    }).start(() => {
      swipeDirection.current = direction;
      
      if (direction === 'left' && onSwipeLeft) {
        onSwipeLeft();
      } else if (direction === 'right' && onSwipeRight) {
        onSwipeRight();
      }
      
      // Reset después de ejecutar la acción
      position.setValue({ x: 0, y: 0 });
    });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => enabled,
      onPanResponderMove: (_, gesture) => {
        if (!enabled) return;
        position.setValue({ x: gesture.dx, y: 0 });
      },
      onPanResponderRelease: (_, gesture) => {
        if (!enabled) return;

        const { dx, vx } = gesture;

        // Si el swipe es rápido o supera el threshold
        if (dx > SWIPE_THRESHOLD || vx > 0.5) {
          forceSwipe('right');
        } else if (dx < -SWIPE_THRESHOLD || vx < -0.5) {
          forceSwipe('left');
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const opacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: [0.5, 1, 0.5],
    extrapolate: 'clamp',
  });

  const scale = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [0.95, 1, 0.95],
    extrapolate: 'clamp',
  });

  // Opacidad de los indicadores de acción
  const leftActionOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, -50, 0],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const rightActionOpacity = position.x.interpolate({
    inputRange: [0, 50, SCREEN_WIDTH / 2],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  const cardStyle = {
    transform: [
      { translateX: position.x },
      { rotate },
      { scale },
    ],
    opacity,
  };

  return {
    panResponder: panResponder.panHandlers,
    cardStyle,
    leftActionOpacity,
    rightActionOpacity,
    forceSwipe,
    resetPosition,
  };
};

/**
 * Hook simplificado para swipe-to-delete (solo deslizar a la izquierda)
 */
export const useSwipeToDelete = (onDelete: () => void, enabled: boolean = true) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const height = useRef(new Animated.Value(1)).current;

  const animateDelete = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -SCREEN_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(height, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false, // height no soporta native driver
      }),
    ]).start(() => {
      onDelete();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => enabled,
      onPanResponderMove: (_, gesture) => {
        if (!enabled) return;
        // Solo permitir deslizar a la izquierda
        if (gesture.dx < 0) {
          translateX.setValue(gesture.dx);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (!enabled) return;

        if (gesture.dx < -SWIPE_THRESHOLD || gesture.vx < -0.5) {
          animateDelete();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            friction: 5,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const deleteProgress = translateX.interpolate({
    inputRange: [-SCREEN_WIDTH, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const backgroundColor = translateX.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0],
    outputRange: ['rgb(239, 68, 68)', 'rgb(255, 255, 255)'],
    extrapolate: 'clamp',
  });

  const deleteIconOpacity = translateX.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return {
    panResponder: panResponder.panHandlers,
    translateX,
    height,
    deleteProgress,
    deleteIconOpacity,
    backgroundColor,
    animateDelete,
  };
};

/**
 * Hook para acciones de swipe en ambas direcciones con iconos
 */
export const useSwipeActions = (
  leftAction?: () => void,
  rightAction?: () => void,
  enabled: boolean = true
) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const ACTION_THRESHOLD = 100;

  const executeAction = (direction: 'left' | 'right') => {
    const targetX = direction === 'left' ? -SCREEN_WIDTH : SCREEN_WIDTH;
    
    Animated.timing(translateX, {
      toValue: targetX,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (direction === 'left' && leftAction) {
        leftAction();
      } else if (direction === 'right' && rightAction) {
        rightAction();
      }
      translateX.setValue(0);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => enabled,
      onPanResponderMove: (_, gesture) => {
        if (!enabled) return;
        translateX.setValue(gesture.dx);
      },
      onPanResponderRelease: (_, gesture) => {
        if (!enabled) return;

        if (gesture.dx < -ACTION_THRESHOLD && leftAction) {
          executeAction('left');
        } else if (gesture.dx > ACTION_THRESHOLD && rightAction) {
          executeAction('right');
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            friction: 7,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const leftActionScale = translateX.interpolate({
    inputRange: [-ACTION_THRESHOLD * 2, -ACTION_THRESHOLD, 0],
    outputRange: [1.2, 1, 0.5],
    extrapolate: 'clamp',
  });

  const rightActionScale = translateX.interpolate({
    inputRange: [0, ACTION_THRESHOLD, ACTION_THRESHOLD * 2],
    outputRange: [0.5, 1, 1.2],
    extrapolate: 'clamp',
  });

  const leftActionOpacity = translateX.interpolate({
    inputRange: [-ACTION_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const rightActionOpacity = translateX.interpolate({
    inputRange: [0, ACTION_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return {
    panResponder: panResponder.panHandlers,
    translateX,
    leftActionScale,
    rightActionScale,
    leftActionOpacity,
    rightActionOpacity,
  };
};
