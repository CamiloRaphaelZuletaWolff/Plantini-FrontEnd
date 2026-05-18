import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Share,
  Linking,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../../config/supabase';
import { useAuthStore } from '../../../../src/store/useAuthStore';
import { useThemeColors } from '../../../../src/hooks';
import { useUserProfile } from '../../../../src/hooks';
import { useRolePermissions } from '../../../../src/hooks';
import { useSubmitFeedbackAnimation } from '../../../../src/hooks';
import { useSharedElementTransition, useFadeScaleTransition } from '../../../../src/hooks';
import { usePostulacion } from '../../../../src/hooks';
import { Oportunidad, MODALIDADES } from '../../../../src/types';
import { PostulacionExitosaModal, LocationSection } from '../../../../src/components';

type DisponibilidadType = 'fin_de_semana' | 'entre_semana' | 'flexible';

export default function OportunidadDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme, colors } = useThemeColors();
  const { user } = useAuthStore();
  const { user: userProfile, toggleFavorito } = useUserProfile();
  const { isStudent, canManageOpportunities } = useRolePermissions();
  const { crearPostulacion } = usePostulacion();

  const [voluntariado, setVoluntariado] = useState<Oportunidad | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [showApplications, setShowApplications] = useState(false);
  
  // Animaciones
  const { animateSubmit, resetAnimation, style: submitButtonStyle } = useSubmitFeedbackAnimation();
  const { animateIn, sharedStyle } = useSharedElementTransition();
  const { fadeIn: fadeInModal, fadeOut: fadeOutModal, style: modalFadeStyle } = useFadeScaleTransition();

  const canApply = isStudent() && voluntariado?.status === 'open';
  
  // Estados para el modal de postulación
  const [modalVisible, setModalVisible] = useState(false);
  const [motivacion, setMotivacion] = useState('');
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadType>('flexible');
  const [telefono, setTelefono] = useState('');
  const [errors, setErrors] = useState<{ motivacion?: string; telefono?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Cargar oportunidad desde Supabase
  useEffect(() => {
    const fetchOportunidad = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('oportunidades')
          .select('*')
          .eq('id', id as string)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (data) {
          const row = data as any;
          setVoluntariado({
            id: row.id,
            titulo: row.titulo,
            titleLower: row.title_lower,
            descripcion: row.descripcion,
            organizacion: row.organizacion,
            organizacionId: row.organizacion_id,
            cover: row.cover,
            campus: row.campus,
            ciudad: row.ciudad,
            categoria: row.categoria,
            modalidad: row.modalidad,
            horasSemana: row.horas_semana,
            deadline: row.deadline,
            cupos: row.cupos,
            cuposDisponibles: row.cupos_disponibles,
            ubicacion: row.ubicacion,
            habilidades: row.habilidades ?? [],
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            createdBy: row.created_by ?? '',
          });
        } else {
          setVoluntariado(null);
        }
      } catch (error) {
        console.error('Error fetching oportunidad:', error);
        setVoluntariado(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOportunidad();
  }, [id]);

  // Animar entrada de la pantalla
  useEffect(() => {
    if (!loading && voluntariado) {
      animateIn();
    }
  }, [loading, voluntariado]);

  // Verificar si es favorito
  useEffect(() => {
    if (userProfile && id) {
      setIsFavorite(userProfile.favoritos?.includes(id as string) || false);
    }
  }, [userProfile, id]);
  
  const screenColors = {
    cardBackground: colors.surface,
    success: '#4CAF50',
    warning: '#FF9800',
    danger: '#FF6B6B',
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Cargando oportunidad...
          </Text>
        </View>
      </View>
    );
  }

  if (!voluntariado) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.subtitle} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            Voluntariado no encontrado
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const getCategoryColor = (categoria: string) => {
    const categoryColors: Record<string, string> = {
      animales: '#FF6B6B',
      educacion: '#4ECDC4',
      'medio-ambiente': '#95E1D3',
      salud: '#F38181',
      comunidad: '#AA96DA',
      social: '#FF6B6B',
      ambiental: '#95E1D3',
      educativo: '#4ECDC4',
      cultural: '#AA96DA',
    };
    return categoryColors[categoria] || colors.primary;
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      open: '#4CAF50',
      waitlist: '#FF9800',
      closed: '#FF6B6B',
      finished: '#9E9E9E',
    };
    return statusColors[status] || colors.primary;
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      open: 'ABIERTO',
      waitlist: 'LISTA DE ESPERA',
      closed: 'CERRADO',
      finished: 'FINALIZADO',
    };
    return statusLabels[status] || status.toUpperCase();
  };

  const disponibles = voluntariado.cuposDisponibles || 0;
  const porcentajeOcupado = ((voluntariado.cupos - disponibles) / voluntariado.cupos) * 100;
  const isCompleto = disponibles <= 0;

  // Formatear fecha si es un timestamp
  const formatDeadline = (deadline: any) => {
    const date = deadline ? new Date(deadline) : null;
    if (!date) return 'Fecha no especificada';
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const validateForm = (): boolean => {
    const newErrors: { motivacion?: string; telefono?: string } = {};
    
    // Validar motivación
    if (!motivacion.trim()) {
      newErrors.motivacion = 'La motivación es requerida';
    } else if (motivacion.trim().length < 50) {
      newErrors.motivacion = `Mínimo 50 caracteres (actual: ${motivacion.trim().length})`;
    }
    
    // Validar teléfono (opcional pero si se ingresa debe ser válido)
    if (telefono.trim() && !/^[+]?[0-9\s-]{7,15}$/.test(telefono.trim())) {
      newErrors.telefono = 'Formato de teléfono inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAplicar = () => {
    if (!canApply) {
      Alert.alert(
        'No Disponible',
        canManageOpportunities() 
          ? 'Como administrador/organizador no puedes postular a oportunidades.'
          : 'No puedes postular a esta oportunidad en este momento.',
        [{ text: 'Entendido' }]
      );
      return;
    }

    if (isCompleto) {
      Alert.alert(
        'Voluntariado Completo',
        'Lo sentimos, este voluntariado ya alcanzó el número máximo de participantes.',
        [{ text: 'Entendido' }]
      );
    } else {
      // Abrir modal de postulación
      setModalVisible(true);
    }
  };

  const handleEdit = () => {
    if (!canManageOpportunities()) return;
    setEditModalVisible(true);
  };

  const handleViewApplications = () => {
    if (!canManageOpportunities()) return;
    setShowApplications(true);
  };

  const handleSubmitPostulacion = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user?.id || !voluntariado) {
      Alert.alert('Error', 'Debes iniciar sesión para postularte');
      return;
    }

    setIsSubmitting(true);
    
    // Animar el botón
    animateSubmit(() => {
      // Callback después de la animación
    });
    
    try {
      console.log('🚀 Iniciando postulación...');
      
      // 🔥 USAR EL HOOK QUE TIENE LAS NOTIFICACIONES
      const result = await crearPostulacion(voluntariado, {
        motivacion,
        disponibilidad,
        telefono: telefono || '',
      });

      if (result.success) {
        console.log('✅ Postulación creada exitosamente con notificaciones');
        
        setIsSubmitting(false);
        setModalVisible(false);
        resetAnimation();
        
        // Limpiar formulario
        setMotivacion('');
        setTelefono('');
        setDisponibilidad('flexible');
        setErrors({});
        
        // Mostrar modal de éxito
        setShowSuccessModal(true);
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('❌ Error al crear postulación:', error);
      setIsSubmitting(false);
      resetAnimation();
      Alert.alert(
        'Error',
        'No se pudo registrar tu postulación. Por favor intenta de nuevo.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCancelPostulacion = () => {
    setModalVisible(false);
    setMotivacion('');
    setTelefono('');
    setDisponibilidad('flexible');
    setErrors({});
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `¡Mira esta oportunidad de voluntariado!\n\n${voluntariado?.titulo}\n\nOrganización: ${voluntariado?.organizacion}\n\nÚnete a esta causa increíble.`,
        title: voluntariado?.titulo,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!id) return;
    await toggleFavorito(id as string);
    setIsFavorite(!isFavorite);
  };

  const handleOpenMap = () => {
    if (!voluntariado?.ubicacion) {
      Alert.alert('Ubicación no disponible', 'Esta oportunidad no tiene una ubicación registrada');
      return;
    }

    const { lat, lng } = voluntariado.ubicacion;
    const label = encodeURIComponent(voluntariado.titulo);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`,
    });

    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'No se pudo abrir el mapa');
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header con emoji y categoría */}
        <View style={[styles.header, { backgroundColor: screenColors.cardBackground }]}>
          <View style={[styles.emojiContainer, { backgroundColor: getCategoryColor(voluntariado.categoria) + '20' }]}>
            <Ionicons name="heart" size={48} color={getCategoryColor(voluntariado.categoria)} />
          </View>
          <View style={styles.headerBadges}>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(voluntariado.categoria) }]}>
              <Text style={styles.categoryText}>{voluntariado.categoria.toUpperCase()}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(voluntariado.status) }]}>
              <Text style={styles.statusText}>{getStatusLabel(voluntariado.status)}</Text>
            </View>
          </View>
        </View>

        {/* Título y Organización */}
        <View style={[styles.section, { backgroundColor: screenColors.cardBackground }]}>
          <Text style={[styles.title, { color: colors.text }]}>{voluntariado.titulo}</Text>
          <View style={styles.organizationRow}>
            <Ionicons name="business" size={18} color={colors.primary} />
            <Text style={[styles.organizationText, { color: colors.primary }]}>
              {voluntariado.organizacion}
            </Text>
          </View>
        </View>

        {/* Información clave */}
        <View style={[styles.section, { backgroundColor: screenColors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Información General</Text>
          
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="calendar" size={20} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.subtitle }]}>Fecha límite</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{formatDeadline(voluntariado.deadline)}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="time" size={20} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.subtitle }]}>Horas por semana</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{voluntariado.horasSemana} horas</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons 
                name={MODALIDADES.find(m => m.key === voluntariado.modalidad)?.icon as any || 'location'} 
                size={20} 
                color={colors.primary} 
              />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.subtitle }]}>Modalidad</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {MODALIDADES.find(m => m.key === voluntariado.modalidad)?.label || voluntariado.modalidad}
              </Text>
            </View>
          </View>
        </View>

        {/* Sección de Ubicación con Mapa */}
        <LocationSection 
          oportunidad={voluntariado}
          onMapPress={() => router.push(`/(drawer)/(tabs)/map/${voluntariado.id}`)}
        />

        {/* Disponibilidad */}
        <View style={[styles.section, { backgroundColor: screenColors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Disponibilidad</Text>
          
          <View style={styles.availabilityCard}>
            <View style={styles.availabilityHeader}>
              <Ionicons 
                name="people" 
                size={24} 
                color={isCompleto ? screenColors.danger : screenColors.success} 
              />
              <View style={styles.availabilityTextContainer}>
                <Text style={[styles.availabilityNumber, { color: colors.text }]}>
                  {disponibles} / {voluntariado.cupos}
                </Text>
                <Text style={[styles.availabilityLabel, { color: colors.subtitle }]}>
                  lugares disponibles
                </Text>
              </View>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    width: `${porcentajeOcupado}%`,
                    backgroundColor: isCompleto ? screenColors.danger : screenColors.success
                  }
                ]} 
              />
            </View>
            
            <Text style={[styles.participantesInfo, { color: colors.subtitle }]}>
              {voluntariado.cupos - disponibles} personas ya se han postulado
            </Text>
          </View>
        </View>

        {/* Descripción */}
        <View style={[styles.section, { backgroundColor: screenColors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Descripción</Text>
          <Text style={[styles.description, { color: colors.text }]}>
            {voluntariado.descripcion}
          </Text>
        </View>

        {/* Habilidades requeridas */}
        {voluntariado.habilidades && voluntariado.habilidades.length > 0 && (
        <View style={[styles.section, { backgroundColor: screenColors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Habilidades Requeridas</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {voluntariado.habilidades.map((habilidad: string, index: number) => (
              <View 
                key={index} 
                style={{
                  backgroundColor: colors.primary + '20',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                }}
              >
                <Text style={[styles.listItemText, { color: colors.primary }]}>{habilidad}</Text>
              </View>
            ))}
          </View>
        </View>
        )}

        {/* Espaciado para el botón fijo */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Botón de postulación fijo */}
      <View style={[styles.footer, { backgroundColor: screenColors.cardBackground, borderTopColor: colors.border }]}>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.surface }]}
            onPress={handleToggleFavorite}
          >
            <Ionicons 
              name={isFavorite ? 'heart' : 'heart-outline'} 
              size={24} 
              color={isFavorite ? '#FF6B6B' : colors.text} 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.surface }]}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={24} color={colors.text} />
          </TouchableOpacity>

          {voluntariado.ubicacion && (
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.surface }]}
              onPress={handleOpenMap}
            >
              <Ionicons name="map-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.applyButton,
            {
              backgroundColor: isCompleto ? colors.muted : colors.primary,
            },
          ]}
          onPress={handleAplicar}
          activeOpacity={0.8}
        >
          <Ionicons name={isCompleto ? 'close-circle' : 'send'} size={20} color="#ffffff" />
          <Text style={styles.applyButtonText}>
            {isCompleto ? 'Voluntariado Completo' : 'Postular a este Voluntariado'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Postulación */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={handleCancelPostulacion}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboardView}
          >
            {/* Header del Modal */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={handleCancelPostulacion}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Postular</Text>
              <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Título de la oportunidad */}
              <View style={[styles.modalOppInfo, { backgroundColor: colors.surface }]}>
                <Text style={[styles.modalOppTitle, { color: colors.text }]}>
                  {voluntariado.titulo}
                </Text>
                <Text style={[styles.modalOppOrg, { color: colors.subtitle }]}>
                  {voluntariado.organizacion}
                </Text>
              </View>

              {/* Campo de Motivación */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>
                  ¿Por qué quieres ser voluntario? *
                </Text>
                <TextInput
                  style={[
                    styles.textArea,
                    { 
                      backgroundColor: colors.surface,
                      borderColor: errors.motivacion ? '#FF6B6B' : colors.border,
                      color: colors.text 
                    }
                  ]}
                  placeholder="Cuéntanos tu motivación para participar en este voluntariado..."
                  placeholderTextColor={colors.subtitle}
                  multiline
                  numberOfLines={6}
                  value={motivacion}
                  onChangeText={(text) => {
                    setMotivacion(text);
                    if (errors.motivacion) {
                      setErrors({ ...errors, motivacion: undefined });
                    }
                  }}
                  textAlignVertical="top"
                  maxLength={500}
                />
                <View style={styles.textAreaFooter}>
                  {errors.motivacion ? (
                    <Text style={styles.errorText}>{errors.motivacion}</Text>
                  ) : (
                    <Text style={[styles.hintText, { color: colors.subtitle }]}>
                      Mínimo 50 caracteres
                    </Text>
                  )}
                  <Text style={[styles.charCount, { color: colors.subtitle }]}>
                    {motivacion.length}/500
                  </Text>
                </View>
              </View>

              {/* Disponibilidad */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>
                  ¿Cuándo estás disponible? *
                </Text>
                <View style={styles.radioGroup}>
                  {[
                    { key: 'fin_de_semana', label: 'Fines de semana', icon: 'calendar' },
                    { key: 'entre_semana', label: 'Entre semana', icon: 'briefcase' },
                    { key: 'flexible', label: 'Flexible', icon: 'time' },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.key}
                      style={[
                        styles.radioOption,
                        {
                          backgroundColor: colors.surface,
                          borderColor: disponibilidad === option.key ? colors.primary : colors.border,
                          borderWidth: disponibilidad === option.key ? 2 : 1,
                        }
                      ]}
                      onPress={() => setDisponibilidad(option.key as DisponibilidadType)}
                    >
                      <View style={[
                        styles.radioCircle,
                        { borderColor: disponibilidad === option.key ? colors.primary : colors.border }
                      ]}>
                        {disponibilidad === option.key && (
                          <View style={[styles.radioCircleInner, { backgroundColor: colors.primary }]} />
                        )}
                      </View>
                      <Ionicons 
                        name={option.icon as any} 
                        size={20} 
                        color={disponibilidad === option.key ? colors.primary : colors.subtitle} 
                      />
                      <Text style={[
                        styles.radioLabel,
                        { color: disponibilidad === option.key ? colors.text : colors.subtitle }
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Teléfono */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>
                  Teléfono de contacto (opcional)
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: colors.surface,
                      borderColor: errors.telefono ? '#FF6B6B' : colors.border,
                      color: colors.text 
                    }
                  ]}
                  placeholder="+591 70000000"
                  placeholderTextColor={colors.subtitle}
                  keyboardType="phone-pad"
                  value={telefono}
                  onChangeText={(text) => {
                    setTelefono(text);
                    if (errors.telefono) {
                      setErrors({ ...errors, telefono: undefined });
                    }
                  }}
                />
                {errors.telefono && (
                  <Text style={styles.errorText}>{errors.telefono}</Text>
                )}
              </View>

              {/* Info adicional */}
              <View style={[styles.infoBox, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="information-circle" size={20} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  Tu postulación será revisada por la organización. Te contactarán por correo o teléfono.
                </Text>
              </View>
            </ScrollView>

            {/* Footer del Modal */}
            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: colors.border }]}
                onPress={handleCancelPostulacion}
                disabled={isSubmitting}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              
              <Animated.View style={[{ flex: 1 }, submitButtonStyle]}>
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    { backgroundColor: colors.primary },
                    isSubmitting && { opacity: 0.6 }
                  ]}
                  onPress={handleSubmitPostulacion}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      Enviar Postulación
                    </Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      <PostulacionExitosaModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.back();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 16,
  },
  emojiContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 50,
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    marginBottom: 12,
  },
  organizationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  organizationText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E220',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  availabilityCard: {
    gap: 12,
  },
  availabilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  availabilityTextContainer: {
    flex: 1,
  },
  availabilityNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  availabilityLabel: {
    fontSize: 14,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  participantesInfo: {
    fontSize: 13,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  listItemText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B6B',
    marginTop: 4,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalKeyboardView: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalOppInfo: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  modalOppTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalOppOrg: {
    fontSize: 14,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    minHeight: 120,
  },
  textAreaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  hintText: {
    fontSize: 12,
  },
  charCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
  },
  radioGroup: {
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  radioLabel: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
});
