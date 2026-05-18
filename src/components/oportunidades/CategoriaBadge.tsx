import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CategoriaType, CATEGORIAS } from '../../types';

interface CategoriaBadgeProps {
  categoria: CategoriaType;
  size?: 'small' | 'medium' | 'large';
}

export const CategoriaBadge: React.FC<CategoriaBadgeProps> = ({ categoria, size = 'medium' }) => {
  const categoriaInfo = CATEGORIAS.find((cat) => cat.key === categoria) || CATEGORIAS[0];

  const sizeStyles = {
    small: { paddingHorizontal: 8, paddingVertical: 4, fontSize: 10, iconSize: 12 },
    medium: { paddingHorizontal: 10, paddingVertical: 6, fontSize: 11, iconSize: 14 },
    large: { paddingHorizontal: 12, paddingVertical: 8, fontSize: 12, iconSize: 16 },
  };

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: categoriaInfo.color },
        {
          paddingHorizontal: sizeStyles[size].paddingHorizontal,
          paddingVertical: sizeStyles[size].paddingVertical,
        },
      ]}
    >
      <Ionicons
        name={categoriaInfo.icon as any}
        size={sizeStyles[size].iconSize}
        color="#fff"
      />
      <Text style={[styles.text, { fontSize: sizeStyles[size].fontSize }]}>
        {categoriaInfo.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    gap: 4,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#fff',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
