import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { CategoriaType } from '../../types';
import { FilterChip } from '../oportunidades/FilterChip';
import { CATEGORIAS, CAMPUS_OPTIONS } from '../../types';
import { useThemeColors } from '../../hooks';

interface MapFiltersProps {
  selectedCategories: CategoriaType[];
  selectedCampus: string[];
  showOnlyCercanas: boolean;
  onCategoryToggle: (categoria: CategoriaType) => void;
  onCampusToggle: (campus: string) => void;
  onCercanasToggle: () => void;
  onClear: () => void;
  activeCount: number;
}

export function MapFilters({
  selectedCategories,
  selectedCampus,
  showOnlyCercanas,
  onCategoryToggle,
  onCampusToggle,
  onCercanasToggle,
  onClear,
  activeCount,
}: MapFiltersProps) {
  const { colors, theme } = useThemeColors();
  const [expanded, setExpanded] = useState(false);
  const translateYAnim = useRef(new Animated.Value(-100)).current;

  // Animación de entrada
  useEffect(() => {
    Animated.spring(translateYAnim, {
      toValue: 0,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          transform: [{ translateY: translateYAnim }],
        },
      ]}
    >
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Ionicons name="filter" size={20} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Filtros</Text>
          {activeCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{activeCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.headerRight}>
          {activeCount > 0 && (
            <TouchableOpacity onPress={onClear} style={styles.clearButton}>
              <Text style={[styles.clearText, { color: colors.primary }]}>
                Limpiar
              </Text>
            </TouchableOpacity>
          )}
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.text}
          />
        </View>
      </TouchableOpacity>

      {/* Contenido expandible */}
      {expanded && (
        <View style={styles.content}>
          {/* Toggle de cercanas */}
          <TouchableOpacity
            style={[
              styles.cercanaToggle,
              {
                backgroundColor: showOnlyCercanas
                  ? `${colors.primary}33`
                  : colors.background,
                borderColor: showOnlyCercanas ? colors.primary : '#E5E5EA',
              },
            ]}
            onPress={onCercanasToggle}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showOnlyCercanas ? 'checkmark-circle' : 'radio-button-off'}
              size={20}
              color={showOnlyCercanas ? colors.primary : '#8E8E93'}
            />
            <Text
              style={[
                styles.cercanaText,
                { color: showOnlyCercanas ? colors.primary : colors.text },
              ]}
            >
              Solo mostrar cercanas (&lt; 5 km)
            </Text>
          </TouchableOpacity>

          {/* Categorías */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Categorías
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsContainer}
            >
              {CATEGORIAS.map((cat) => (
                <FilterChip
                  key={cat.key}
                  label={cat.label}
                  icon={cat.icon}
                  selected={selectedCategories.includes(cat.key)}
                  onPress={() => onCategoryToggle(cat.key)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Campus */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Campus
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsContainer}
            >
              {CAMPUS_OPTIONS.map((campus) => (
                <FilterChip
                  key={campus}
                  label={campus}
                  selected={selectedCampus.includes(campus)}
                  onPress={() => onCampusToggle(campus)}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clearButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  cercanaToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  cercanaText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  chipsContainer: {
    gap: 8,
    paddingRight: 16,
  },
});
