import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeColors } from '../../hooks';
import { useCreateOportunidad } from '../../hooks/oportunidades/useCreateOportunidad';
import { CategoriaType, ModalidadType } from '../../types';
import { CATEGORIAS, MODALIDADES, CAMPUS_OPTIONS, HABILIDADES_COMUNES } from '../../types';

interface OportunidadModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateOportunidadModal: React.FC<OportunidadModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuthStore();
  const { colors } = useThemeColors();
  const { create: createOportunidad } = useCreateOportunidad();

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    organizacion: '',
    organizacionId: '',
    campus: CAMPUS_OPTIONS[0],
    ciudad: '',
    categoria: CATEGORIAS[0].key,
    modalidad: MODALIDADES[0].key,
    horasSemana: 0,
    cupos: 0,
    habilidades: [] as string[],
    deadline: {
      day: new Date().getDate(),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    }
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedHabilidades, setSelectedHabilidades] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo) newErrors.titulo = 'El título es requerido';
    if (!formData.descripcion) newErrors.descripcion = 'La descripción es requerida';
    if (!formData.organizacion) newErrors.organizacion = 'La organización es requerida';
    if (!formData.ciudad) newErrors.ciudad = 'La ciudad es requerida';
    if (!formData.categoria) newErrors.categoria = 'La categoría es requerida';
    if (!formData.modalidad) newErrors.modalidad = 'La modalidad es requerida';
    if (formData.horasSemana <= 0) newErrors.horasSemana = 'Las horas por semana deben ser mayores a 0';
    if (formData.cupos <= 0) newErrors.cupos = 'Los cupos deben ser mayores a 0';
    if (selectedHabilidades.length === 0) newErrors.habilidades = 'Selecciona al menos una habilidad';
    
    const selectedDate = new Date(formData.deadline.year, formData.deadline.month - 1, formData.deadline.day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      newErrors.deadline = 'La fecha límite debe ser futura';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!user) return;
    if (!validateForm()) return;

    setLoading(true);
    try {
      const deadline = new Date(
        formData.deadline.year,
        formData.deadline.month - 1,
        formData.deadline.day,
      );

      const result = await createOportunidad({
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        organizacion: formData.organizacion,
        organizacionId: formData.organizacionId,
        campus: formData.campus,
        ciudad: formData.ciudad,
        categoria: formData.categoria,
        modalidad: formData.modalidad,
        horasSemana: formData.horasSemana,
        cupos: formData.cupos,
        habilidades: selectedHabilidades,
        deadline,
      });

      if (!result.success) {
        Alert.alert('Error', result.error || 'No se pudo crear la oportunidad');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '✅ Oportunidad Creada',
          body: `"${formData.titulo}" se publicó exitosamente. Los usuarios ya pueden verla.`,
          data: { type: 'oportunidad_creada', oportunidadId: result.id },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger: null,
      });

      if (__DEV__) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🆕 Nueva Oportunidad Disponible',
            body: `${formData.titulo} - ${CATEGORIAS.find((c) => c.key === formData.categoria)?.label}`,
            data: { type: 'nueva_oportunidad', oportunidadId: result.id, isDemo: true },
            sound: true,
            priority: Notifications.AndroidNotificationPriority.DEFAULT,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: new Date(Date.now() + 5000),
          },
        });
      }

      Alert.alert('Éxito', 'Oportunidad creada correctamente');
      onSuccess?.();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent={true}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Crear Nueva Oportunidad
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            <View style={styles.form}>
              {/* Información Básica */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Información Básica</Text>
                
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: errors.titulo ? '#FF6B6B' : colors.border }]}
                  placeholder="Título de la oportunidad"
                  value={formData.titulo}
                  onChangeText={(text) => setFormData({ ...formData, titulo: text })}
                  placeholderTextColor={colors.muted}
                />
                {errors.titulo && <Text style={styles.errorText}>{errors.titulo}</Text>}
                
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: colors.surface, borderColor: errors.descripcion ? '#FF6B6B' : colors.border }]}
                  placeholder="Descripción detallada"
                  value={formData.descripcion}
                  onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor={colors.muted}
                />
                {errors.descripcion && <Text style={styles.errorText}>{errors.descripcion}</Text>}
              </View>

              {/* Organización */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Organización</Text>
                
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: errors.organizacion ? '#FF6B6B' : colors.border }]}
                  placeholder="Nombre de la organización"
                  value={formData.organizacion}
                  onChangeText={(text) => setFormData({ ...formData, organizacion: text })}
                  placeholderTextColor={colors.muted}
                />
                {errors.organizacion && <Text style={styles.errorText}>{errors.organizacion}</Text>}
              </View>

              {/* Ubicación */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Ubicación</Text>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                  {CAMPUS_OPTIONS.map((campus) => (
                    <TouchableOpacity
                      key={campus}
                      style={[
                        styles.chip,
                        { backgroundColor: formData.campus === campus ? colors.primary : colors.surface }
                      ]}
                      onPress={() => setFormData({ ...formData, campus })}
                    >
                      <Text style={[styles.chipText, { color: formData.campus === campus ? '#fff' : colors.text }]}>
                        {campus}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: errors.ciudad ? '#FF6B6B' : colors.border }]}
                  placeholder="Ciudad"
                  value={formData.ciudad}
                  onChangeText={(text) => setFormData({ ...formData, ciudad: text })}
                  placeholderTextColor={colors.muted}
                />
                {errors.ciudad && <Text style={styles.errorText}>{errors.ciudad}</Text>}
              </View>

              {/* Detalles */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Detalles</Text>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                  {CATEGORIAS.map((cat) => (
                    <TouchableOpacity
                      key={cat.key}
                      style={[
                        styles.chip,
                        { backgroundColor: formData.categoria === cat.key ? colors.primary : colors.surface }
                      ]}
                      onPress={() => setFormData({ ...formData, categoria: cat.key })}
                    >
                      <Text style={[styles.chipText, { color: formData.categoria === cat.key ? '#fff' : colors.text }]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {errors.categoria && <Text style={styles.errorText}>{errors.categoria}</Text>}

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                  {MODALIDADES.map((mod) => (
                    <TouchableOpacity
                      key={mod.key}
                      style={[
                        styles.chip,
                        { backgroundColor: formData.modalidad === mod.key ? colors.primary : colors.surface }
                      ]}
                      onPress={() => setFormData({ ...formData, modalidad: mod.key })}
                    >
                      <Text style={[styles.chipText, { color: formData.modalidad === mod.key ? '#fff' : colors.text }]}>
                        {mod.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {errors.modalidad && <Text style={styles.errorText}>{errors.modalidad}</Text>}

                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.surface, borderColor: errors.horasSemana ? '#FF6B6B' : colors.border }]}
                      placeholder="Horas/semana"
                      value={formData.horasSemana.toString()}
                      onChangeText={(text) => setFormData({ ...formData, horasSemana: parseInt(text) || 0 })}
                      keyboardType="numeric"
                      placeholderTextColor={colors.muted}
                    />
                    {errors.horasSemana && <Text style={styles.errorText}>{errors.horasSemana}</Text>}
                  </View>

                  <View style={styles.halfInput}>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.surface, borderColor: errors.cupos ? '#FF6B6B' : colors.border }]}
                      placeholder="Cupos"
                      value={formData.cupos.toString()}
                      onChangeText={(text) => setFormData({ ...formData, cupos: parseInt(text) || 0 })}
                      keyboardType="numeric"
                      placeholderTextColor={colors.muted}
                    />
                    {errors.cupos && <Text style={styles.errorText}>{errors.cupos}</Text>}
                  </View>
                </View>
              </View>

              {/* Habilidades */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Habilidades Requeridas</Text>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                  {HABILIDADES_COMUNES.map((hab) => (
                    <TouchableOpacity
                      key={hab}
                      style={[
                        styles.chip,
                        { backgroundColor: selectedHabilidades.includes(hab) ? colors.primary : colors.surface }
                      ]}
                      onPress={() => {
                        if (selectedHabilidades.includes(hab)) {
                          setSelectedHabilidades(selectedHabilidades.filter(h => h !== hab));
                        } else {
                          setSelectedHabilidades([...selectedHabilidades, hab]);
                        }
                      }}
                    >
                      <Text style={[styles.chipText, { color: selectedHabilidades.includes(hab) ? '#fff' : colors.text }]}>
                        {hab}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {errors.habilidades && <Text style={styles.errorText}>{errors.habilidades}</Text>}
              </View>

              {/* Fecha límite */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Fecha Límite</Text>
                
                <View style={styles.dateInputContainer}>
                  <View style={styles.dateInput}>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.surface, borderColor: errors.deadline ? '#FF6B6B' : colors.border }]}
                      placeholder="Día"
                      value={formData.deadline.day.toString()}
                      onChangeText={(text) => {
                        const day = parseInt(text) || 1;
                        setFormData({
                          ...formData,
                          deadline: { ...formData.deadline, day: Math.min(Math.max(day, 1), 31) }
                        });
                      }}
                      keyboardType="numeric"
                      maxLength={2}
                      placeholderTextColor={colors.muted}
                    />
                  </View>
                  <View style={styles.dateInput}>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.surface, borderColor: errors.deadline ? '#FF6B6B' : colors.border }]}
                      placeholder="Mes"
                      value={formData.deadline.month.toString()}
                      onChangeText={(text) => {
                        const month = parseInt(text) || 1;
                        setFormData({
                          ...formData,
                          deadline: { ...formData.deadline, month: Math.min(Math.max(month, 1), 12) }
                        });
                      }}
                      keyboardType="numeric"
                      maxLength={2}
                      placeholderTextColor={colors.muted}
                    />
                  </View>
                  <View style={[styles.dateInput, { flex: 1.5 }]}>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.surface, borderColor: errors.deadline ? '#FF6B6B' : colors.border }]}
                      placeholder="Año"
                      value={formData.deadline.year.toString()}
                      onChangeText={(text) => {
                        const year = parseInt(text) || new Date().getFullYear();
                        setFormData({
                          ...formData,
                          deadline: { ...formData.deadline, year }
                        });
                      }}
                      keyboardType="numeric"
                      maxLength={4}
                      placeholderTextColor={colors.muted}
                    />
                  </View>
                </View>
                {errors.deadline && <Text style={styles.errorText}>{errors.deadline}</Text>}
              </View>

              {/* Botones */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
                  onPress={onClose}
                >
                  <Text style={[styles.buttonText, { color: colors.text }]}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  <Text style={[styles.buttonText, { color: '#fff' }]}>
                    {loading ? 'Guardando...' : 'Crear Oportunidad'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 0 : 20,
  },
  scrollContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  form: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  halfInput: {
    flex: 1,
  },
  chipContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  chipText: {
    fontSize: 14,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  saveButton: {
    borderWidth: 0,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dateInput: {
    flex: 1,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});