import { useRef, useCallback } from 'react';
import React from 'react';
import { Animated, PanResponder, RefreshControl } from 'react-native';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxPullDistance?: number;
}

/**
 * Hook personalizado para Pull to Refresh con animaciones suaves
 */
export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
  maxPullDistance = 150,
}: PullToRefreshOptions) => {
  const pullDistance = useRef(new Animated.Value(0)).current;
  const isRefreshing = useRef(false);
  const rotation = useRef(new Animated.Value(0)).current;

  const handleRefresh = useCallback(async () => {
    if (isRefreshing.current) return;

    isRefreshing.current = true;
    Animated.spring(pullDistance, {
      toValue: threshold,
      friction: 5,
      useNativeDriver: true,
    }).start();

    const rotationAnimation = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    rotationAnimation.start();

    try {
      await onRefresh();
    } finally {
      rotationAnimation.stop();
      rotation.setValue(0);
      Animated.spring(pullDistance, {
        toValue: 0,
        friction: 7,
        useNativeDriver: true,
      }).start(() => {
        isRefreshing.current = false;
      });
    }
  }, [onRefresh, threshold]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5 && !isRefreshing.current;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0 && gestureState.dy <= maxPullDistance) {
          pullDistance.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy >= threshold) {
          handleRefresh();
        } else {
          Animated.spring(pullDistance, {
            toValue: 0,
            friction: 7,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const progress = pullDistance.interpolate({
    inputRange: [0, threshold],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const rotationDeg = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const indicatorOpacity = pullDistance.interpolate({
    inputRange: [0, threshold / 2, threshold],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  const indicatorScale = pullDistance.interpolate({
    inputRange: [0, threshold],
    outputRange: [0.5, 1],
    extrapolate: 'clamp',
  });

  return {
    panResponder,
    pullDistance,
    progress,
    rotation: rotationDeg,
    indicatorOpacity,
    indicatorScale,
    isRefreshing: isRefreshing.current,
  };
};

/**
 * Hook simplificado que retorna un RefreshControl configurado
 * @param onRefresh - Función de actualización
 * @param refreshing - Estado de refreshing
 * @param tintColor - Color del indicador
 */
export const useAnimatedRefresh = (
  onRefresh: () => void | Promise<void>,
  refreshing: boolean,
  tintColor?: string
) => {
  const refreshControl = React.createElement(RefreshControl, {
    refreshing,
    onRefresh,
    tintColor: tintColor || '#007AFF',
    colors: [tintColor || '#007AFF'],
  });

  return { refreshControl };
};
