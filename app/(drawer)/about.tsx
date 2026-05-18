import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../src/hooks';

export default function AboutScreen() {
  const { colors } = useThemeColors();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.iconContainer}>
          <Image 
            source={require('../../assets/Plantini/plantiniNerd.png')} 
            style={styles.mascotImage}
            resizeMode="contain"
          />
        </View>
        
        <Text style={[styles.title, { color: colors.text }]}>
          Acerca de Voluntariado UPB
        </Text>
        
        <Text style={[styles.description, { color: colors.subtitle }]}>
          Plataforma dedicada a conectar estudiantes con oportunidades 
          de voluntariado significativas y transformadoras.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Nuestra Misión
        </Text>
        <Text style={[styles.text, { color: colors.subtitle }]}>
          Facilitar la participación estudiantil en actividades de voluntariado 
          que promuevan el desarrollo personal, la responsabilidad social y el 
          impacto positivo en la comunidad.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Características
        </Text>
        
        <View style={styles.featureItem}>
          <Ionicons name="search" size={24} color={colors.primary} />
          <View style={styles.featureText}>
            <Text style={[styles.featureTitle, { color: colors.text }]}>
              Búsqueda Inteligente
            </Text>
            <Text style={[styles.featureDescription, { color: colors.subtitle }]}>
              Encuentra voluntariados por categoría y ubicación
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Ionicons name="bookmark" size={24} color={colors.primary} />
          <View style={styles.featureText}>
            <Text style={[styles.featureTitle, { color: colors.text }]}>
              Mis Postulaciones
            </Text>
            <Text style={[styles.featureDescription, { color: colors.subtitle }]}>
              Gestiona todas tus postulaciones en un solo lugar
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Ionicons name="calendar" size={24} color={colors.primary} />
          <View style={styles.featureText}>
            <Text style={[styles.featureTitle, { color: colors.text }]}>
              Calendario
            </Text>
            <Text style={[styles.featureDescription, { color: colors.subtitle }]}>
              Organiza tu tiempo y no pierdas ninguna oportunidad
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.version, { color: colors.subtitle }]}>
          Versión 1.0.1
        </Text>
        <Text style={[styles.footerText, { color: colors.subtitle }]}>
          © 2025 Universidad Privada Boliviana
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 60 : 40,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  mascotImage: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  text: {
    fontSize: 15,
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  comingSoonBadge: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  comingSoonList: {
    marginTop: 12,
    gap: 8,
  },
  comingSoonItem: {
    fontSize: 14,
    lineHeight: 22,
  },
  footer: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  version: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
