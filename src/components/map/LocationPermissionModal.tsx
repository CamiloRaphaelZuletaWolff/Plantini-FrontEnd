import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '../../hooks';

interface LocationPermissionModalProps {
  visible: boolean;
  onRequestPermission: () => void;
  onCancel: () => void;
}

export function LocationPermissionModal({
  visible,
  onRequestPermission,
  onCancel,
}: LocationPermissionModalProps) {
  const { colors } = useThemeColors();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onCancel}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          {/* Ícono grande */}
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
            <Ionicons name="location" size={80} color={colors.primary} />
          </View>

          {/* Título */}
          <Text style={[styles.title, { color: colors.text }]}>
            Acceso a tu Ubicación
          </Text>

          {/* Descripción */}
          <Text style={[styles.description, { color: colors.subtitle }]}>
            VoluntariadoUPB necesita acceder a tu ubicación para ofrecerte la mejor
            experiencia
          </Text>

          {/* Lista de beneficios */}
          <View style={styles.benefitsList}>
            <BenefitItem
              icon="navigate"
              iconColor="#007AFF"
              text="Mostrar oportunidades cercanas ordenadas por distancia"
              colors={colors}
            />
            <BenefitItem
              icon="map"
              iconColor="#34C759"
              text="Calcular rutas y tiempo de viaje a cada oportunidad"
              colors={colors}
            />
            <BenefitItem
              icon="notifications"
              iconColor="#FF9500"
              text="Recibir notificaciones de eventos próximos cercanos"
              colors={colors}
            />
            <BenefitItem
              icon="search"
              iconColor="#AF52DE"
              text="Descubrir nuevas oportunidades en tu zona"
              colors={colors}
            />
          </View>

          {/* Botones */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={onRequestPermission}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Permitir Ubicación</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: colors.border }]}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                Ahora No
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

interface BenefitItemProps {
  icon: string;
  iconColor: string;
  text: string;
  colors: any;
}

function BenefitItem({ icon, iconColor, text, colors }: BenefitItemProps) {
  return (
    <View style={styles.benefitItem}>
      <View style={[styles.benefitIcon, { backgroundColor: `${iconColor}20` }]}>
        <Ionicons name={icon as any} size={24} color={iconColor} />
      </View>
      <Text style={[styles.benefitText, { color: colors.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 24,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  benefitsList: {
    width: '100%',
    gap: 16,
    marginTop: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  buttons: {
    width: '100%',
    gap: 12,
    marginTop: 16,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
