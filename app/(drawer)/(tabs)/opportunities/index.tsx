import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../../../src/hooks';
import { useOportunidades } from '../../../../src/hooks';
import { useOportunidadesStore } from '../../../../src/store/oportunidadesStore';
import { useUserProfile } from '../../../../src/hooks';
import { useRolePermissions } from '../../../../src/hooks';
import { useAnimatedRefresh } from '../../../../src/hooks';
import { OportunidadCard, FilterChip, EmptyState, LoadingSkeleton, CreateOportunidadModal } from '../../../../src/components';
import {
  CATEGORIAS,
  MODALIDADES,
  CAMPUS_OPTIONS,
  HABILIDADES_COMUNES,
  DISPONIBILIDAD_OPTIONS,
  CategoriaType,
  ModalidadType,
  DisponibilidadType,
} from '../../../../src/types';

export default function OportunidadesListScreen() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const { oportunidades, loading, refreshing, refresh } = useOportunidades();
  const { filtros, setFiltros, clearFiltros } = useOportunidadesStore();
  const { user, toggleFavorito } = useUserProfile();
  const { canCreateOpportunity } = useRolePermissions();
  
  // Hook de pull-to-refresh animado
  const { refreshControl } = useAnimatedRefresh(refresh, refreshing, colors.primary);

  const [searchInput, setSearchInput] = useState(filtros.busqueda);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const handleCreateSuccess = () => {
    refresh();
    setCreateModalVisible(false);
  };
  
  const [tempCampus, setTempCampus] = useState<string[]>(filtros.campus);
  const [tempCategoria, setTempCategoria] = useState<CategoriaType[]>(filtros.categoria);
  const [tempModalidad, setTempModalidad] = useState<ModalidadType | null>(filtros.modalidad);
  const [tempDisponibilidad, setTempDisponibilidad] = useState<string[]>(filtros.disponibilidad);
  const [tempHabilidades, setTempHabilidades] = useState<string[]>(filtros.habilidades);

  // Per-instance debounce timer, cleared on unmount so we don't fire the
  // setFiltros update after the screen has been popped.
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  const handleSearchChange = (text: string) => {
    setSearchInput(text);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setFiltros({ busqueda: text.toLowerCase() });
    }, 300);
  };

  const handleFavorite = useCallback(async (oportunidadId: string) => {
    await toggleFavorito(oportunidadId);
  }, [toggleFavorito]);

  const isFavorite = useCallback((oportunidadId: string) => {
    return user?.favoritos?.includes(oportunidadId) || false;
  }, [user?.favoritos]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filtros.campus.length > 0) count += filtros.campus.length;
    if (filtros.categoria.length > 0) count += filtros.categoria.length;
    if (filtros.modalidad) count += 1;
    if (filtros.disponibilidad.length > 0) count += filtros.disponibilidad.length;
    if (filtros.habilidades.length > 0) count += filtros.habilidades.length;
    if (filtros.busqueda) count += 1;
    return count;
  }, [filtros]);

  const handleApplyFilters = () => {
    setFiltros({
      campus: tempCampus,
      categoria: tempCategoria,
      modalidad: tempModalidad,
      disponibilidad: tempDisponibilidad,
      habilidades: tempHabilidades,
    });
    setFilterModalVisible(false);
  };

  const handleClearFilters = () => {
    setTempCampus([]);
    setTempCategoria([]);
    setTempModalidad(null);
    setTempDisponibilidad([]);
    setTempHabilidades([]);
    clearFiltros();
    setSearchInput('');
    setFilterModalVisible(false);
  };

  const openFilterModal = () => {
    setTempCampus(filtros.campus);
    setTempCategoria(filtros.categoria);
    setTempModalidad(filtros.modalidad);
    setTempDisponibilidad(filtros.disponibilidad);
    setTempHabilidades(filtros.habilidades);
    setFilterModalVisible(true);
  };

  const toggleSelection = <T,>(array: T[], item: T, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    if (array.includes(item)) {
      setter(array.filter((i) => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  const removeFilter = (type: string, value?: any) => {
    switch (type) {
      case 'campus':
        setFiltros({ campus: filtros.campus.filter((c) => c !== value) });
        break;
      case 'categoria':
        setFiltros({ categoria: filtros.categoria.filter((c) => c !== value) });
        break;
      case 'modalidad':
        setFiltros({ modalidad: null });
        break;
      case 'disponibilidad':
        setFiltros({ disponibilidad: filtros.disponibilidad.filter((d) => d !== value) });
        break;
      case 'habilidad':
        setFiltros({ habilidades: filtros.habilidades.filter((h) => h !== value) });
        break;
      case 'busqueda':
        setSearchInput('');
        setFiltros({ busqueda: '' });
        break;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <CreateOportunidadModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSuccess={handleCreateSuccess}
      />

      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.subtitle} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar oportunidades..."
            placeholderTextColor={colors.subtitle}
            value={searchInput}
            onChangeText={handleSearchChange}
          />
          {searchInput.length > 0 && (
            <TouchableOpacity onPress={() => handleSearchChange('')}>
              <Ionicons name="close-circle" size={20} color={colors.subtitle} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: colors.primary }]}
          onPress={openFilterModal}
        >
          <Ionicons name="filter" size={20} color="#fff" />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {canCreateOpportunity() && (
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: colors.primary }]}
            onPress={() => setCreateModalVisible(true)}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {activeFiltersCount > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.activeFilters}
        >
          {filtros.busqueda && (
            <FilterChip
              label={`"${filtros.busqueda}"`}
              selected={true}
              onPress={() => removeFilter('busqueda')}
              icon="close"
            />
          )}
          {filtros.campus.map((campus) => (
            <FilterChip
              key={campus}
              label={campus}
              selected={true}
              onPress={() => removeFilter('campus', campus)}
              icon="close"
            />
          ))}
          {filtros.categoria.map((cat) => (
            <FilterChip
              key={cat}
              label={CATEGORIAS.find((c) => c.key === cat)?.label || cat}
              selected={true}
              onPress={() => removeFilter('categoria', cat)}
              icon="close"
            />
          ))}
          {filtros.modalidad && (
            <FilterChip
              label={filtros.modalidad}
              selected={true}
              onPress={() => removeFilter('modalidad')}
              icon="close"
            />
          )}
          {filtros.disponibilidad.map((disp) => (
            <FilterChip
              key={disp}
              label={DISPONIBILIDAD_OPTIONS.find((d) => d.key === disp)?.label || disp}
              selected={true}
              onPress={() => removeFilter('disponibilidad', disp)}
              icon="close"
            />
          ))}
          {filtros.habilidades.map((hab) => (
            <FilterChip
              key={hab}
              label={hab}
              selected={true}
              onPress={() => removeFilter('habilidad', hab)}
              icon="close"
            />
          ))}
        </ScrollView>
      )}

      <View style={styles.resultsSection}>
        <Text style={[styles.resultsText, { color: colors.subtitle }]}>
          {oportunidades.length} {oportunidades.length === 1 ? 'oportunidad encontrada' : 'oportunidades encontradas'}
        </Text>
        {activeFiltersCount > 0 && (
          <TouchableOpacity onPress={handleClearFilters}>
            <Text style={[styles.clearFiltersText, { color: colors.primary }]}>
              Limpiar filtros
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && !refreshing ? (
        <LoadingSkeleton type="card" count={5} />
      ) : (
        <FlatList
          data={oportunidades}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <OportunidadCard
              oportunidad={item}
              onPress={() => router.push(`/opportunities/${item.id}`)}
              onFavorite={() => handleFavorite(item.id)}
              isFavorite={isFavorite(item.id)}
              index={index}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={refreshControl}
          ListEmptyComponent={
            <EmptyState
              icon="search"
              title="No se encontraron oportunidades"
              description="Intenta ajustar los filtros o buscar con otros términos"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Filtros</Text>
            <TouchableOpacity onPress={handleClearFilters}>
              <Text style={[styles.clearText, { color: colors.primary }]}>Limpiar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.filterSection}>
              <Text style={[styles.filterTitle, { color: colors.text }]}>Campus</Text>
              <View style={styles.chipContainer}>
                {CAMPUS_OPTIONS.map((campus) => (
                  <FilterChip
                    key={campus}
                    label={campus}
                    selected={tempCampus.includes(campus)}
                    onPress={() => toggleSelection(tempCampus, campus, setTempCampus)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={[styles.filterTitle, { color: colors.text }]}>Categorías</Text>
              <View style={styles.chipContainer}>
                {CATEGORIAS.map((cat) => (
                  <FilterChip
                    key={cat.key}
                    label={cat.label}
                    selected={tempCategoria.includes(cat.key)}
                    onPress={() => toggleSelection(tempCategoria, cat.key, setTempCategoria)}
                    icon={cat.icon}
                  />
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={[styles.filterTitle, { color: colors.text }]}>Modalidad</Text>
              <View style={styles.chipContainer}>
                {MODALIDADES.map((mod) => (
                  <FilterChip
                    key={mod.key}
                    label={mod.label}
                    selected={tempModalidad === mod.key}
                    onPress={() => setTempModalidad(tempModalidad === mod.key ? null : mod.key)}
                    icon={mod.icon}
                  />
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={[styles.filterTitle, { color: colors.text }]}>Disponibilidad Horaria</Text>
              <View style={styles.chipContainer}>
                {DISPONIBILIDAD_OPTIONS.map((disp) => (
                  <FilterChip
                    key={disp.key}
                    label={disp.label}
                    selected={tempDisponibilidad.includes(disp.key)}
                    onPress={() => toggleSelection(tempDisponibilidad, disp.key, setTempDisponibilidad)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={[styles.filterTitle, { color: colors.text }]}>Habilidades</Text>
              <View style={styles.chipContainer}>
                {HABILIDADES_COMUNES.map((hab) => (
                  <FilterChip
                    key={hab}
                    label={hab}
                    selected={tempHabilidades.includes(hab)}
                    onPress={() => toggleSelection(tempHabilidades, hab, setTempHabilidades)}
                  />
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
              onPress={handleApplyFilters}
            >
              <Text style={styles.applyButtonText}>Aplicar filtros</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchSection: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, gap: 8 },
  searchInput: { flex: 1, fontSize: 16 },
  filterButton: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  filterBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#FF6B6B', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  filterBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  activeFilters: { 
    paddingHorizontal: 16, 
    paddingBottom: 8,
    alignItems: 'center',
    height: 52, 
  },
  resultsSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  resultsText: { fontSize: 14, fontWeight: '500' },
  clearFiltersText: { fontSize: 14, fontWeight: '600' },
  listContent: { paddingHorizontal: 16, paddingBottom: 16 },
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  clearText: { fontSize: 16, fontWeight: '600' },
  modalContent: { flex: 1, paddingHorizontal: 20 },
  filterSection: { marginTop: 24 },
  filterTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  chipContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    alignItems: 'center', 
  },
  modalFooter: { paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1 },
  applyButton: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  applyButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
