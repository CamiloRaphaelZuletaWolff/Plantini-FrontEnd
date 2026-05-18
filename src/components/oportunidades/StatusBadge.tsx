import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OportunidadStatusType } from '../../types';

interface StatusBadgeProps {
  status: OportunidadStatusType;
  size?: 'small' | 'medium' | 'large';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'medium' }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'open':
        return '#51CF66';
      case 'waitlist':
        return '#FFA94D';
      case 'closed':
        return '#ADB5BD';
      case 'finished':
        return '#FF6B6B';
      default:
        return '#868E96';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'open':
        return 'Abierta';
      case 'waitlist':
        return 'Lista de espera';
      case 'closed':
        return 'Cerrada';
      case 'finished':
        return 'Finalizada';
      default:
        return 'Desconocido';
    }
  };

  const sizeStyles = {
    small: { paddingHorizontal: 8, paddingVertical: 4, fontSize: 10 },
    medium: { paddingHorizontal: 12, paddingVertical: 6, fontSize: 11 },
    large: { paddingHorizontal: 16, paddingVertical: 8, fontSize: 12 },
  };

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: getStatusColor() },
        {
          paddingHorizontal: sizeStyles[size].paddingHorizontal,
          paddingVertical: sizeStyles[size].paddingVertical,
        },
      ]}
    >
      <Text style={[styles.text, { fontSize: sizeStyles[size].fontSize }]}>
        {getStatusLabel()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#fff',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
