import React from 'react';
import {
  View,
  Text,
  Modal,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks';
import { LA_PAZ_COORDINATES } from '../../utils/mapHelpers';

interface TempLocation {
  lat: number;
  lng: number;
  direccion: string;
}

interface LocationMapModalProps {
  visible: boolean;
  title: string;
  tempLocation: TempLocation | null;
  saving: boolean;
  onClose: () => void;
  onMapPress: (latitude: number, longitude: number) => void;
  onDireccionChange: (direccion: string) => void;
  onSave: () => void;
}

export const LocationMapModal: React.FC<LocationMapModalProps> = ({
  visible,
  title,
  tempLocation,
  saving,
  onClose,
  onMapPress,
  onDireccionChange,
  onSave,
}) => {
  const { colors } = useThemeColors();

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    Keyboard.dismiss();
    onMapPress(latitude, longitude);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            onPress={() => {
              Keyboard.dismiss();
              onClose();
            }}
          >
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Mapa */}
        <MapView
          style={styles.map}
          provider={Platform.OS === 'android' ? undefined : PROVIDER_GOOGLE}
          initialRegion={{
            latitude: tempLocation?.lat || LA_PAZ_COORDINATES.latitude,
            longitude: tempLocation?.lng || LA_PAZ_COORDINATES.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          onPress={handleMapPress}
        >
          {tempLocation && (
            <Marker
              coordinate={{
                latitude: tempLocation.lat,
                longitude: tempLocation.lng,
              }}
              draggable
              onDragEnd={handleMapPress}
            >
              <View style={styles.customMarker}>
                <Ionicons name="location" size={48} color={colors.primary} />
              </View>
            </Marker>
          )}
        </MapView>

        {/* Panel de información */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ maxHeight: '45%' }}>
            <ScrollView
              style={[styles.infoPanel, { backgroundColor: colors.surface }]}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.infoPanelContent}
            >
              <Text style={[styles.infoPanelTitle, { color: colors.text }]}>
                Información de Ubicación
              </Text>

              {/* Coordenadas */}
              {tempLocation && (
                <View style={styles.coordsContainer}>
                  <View style={styles.coordItem}>
                    <Text style={[styles.coordLabel, { color: colors.subtitle }]}>
                      Latitud:
                    </Text>
                    <Text style={[styles.coordValue, { color: colors.text }]}>
                      {tempLocation.lat.toFixed(6)}
                    </Text>
                  </View>
                  <View style={styles.coordItem}>
                    <Text style={[styles.coordLabel, { color: colors.subtitle }]}>
                      Longitud:
                    </Text>
                    <Text style={[styles.coordValue, { color: colors.text }]}>
                      {tempLocation.lng.toFixed(6)}
                    </Text>
                  </View>
                </View>
              )}

              {/* Input de dirección */}
              <View style={styles.inputContainer}>
                <Ionicons name="home" size={20} color={colors.subtitle} />
                <TextInput
                  style={[styles.addressInput, { color: colors.text }]}
                  placeholder="Escribe la dirección (ej: Av. Ecuador 2244, La Paz)"
                  placeholderTextColor={colors.muted}
                  value={tempLocation?.direccion || ''}
                  onChangeText={onDireccionChange}
                  multiline
                  returnKeyType="done"
                  blurOnSubmit
                  onSubmitEditing={Keyboard.dismiss}
                />
              </View>

              {/* Instrucciones */}
              <View style={styles.instructionsContainer}>
                <Ionicons name="information-circle" size={20} color={colors.primary} />
                <Text style={[styles.instructionsText, { color: colors.subtitle }]}>
                  Toca en el mapa para seleccionar la ubicación o arrastra el marcador
                </Text>
              </View>

              {/* Botones */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    { borderColor: colors.border, backgroundColor: colors.background },
                  ]}
                  onPress={() => {
                    Keyboard.dismiss();
                    onClose();
                  }}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    { backgroundColor: colors.primary },
                    saving && styles.saveButtonDisabled,
                  ]}
                  onPress={() => {
                    Keyboard.dismiss();
                    onSave();
                  }}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                      <Text style={styles.saveButtonText}>Guardar Ubicación</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  map: {
    flex: 1,
  },
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoPanel: {
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  infoPanelContent: {
    gap: 16,
  },
  infoPanelTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  coordsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  coordItem: {
    flex: 1,
  },
  coordLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  coordValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  addressInput: {
    flex: 1,
    fontSize: 16,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(33, 120, 104, 0.1)',
  },
  instructionsText: {
    fontSize: 12,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
