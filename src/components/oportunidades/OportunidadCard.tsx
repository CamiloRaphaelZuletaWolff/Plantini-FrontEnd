import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Oportunidad, CATEGORIAS } from '../../types';
import { useThemeColors } from '../../hooks';
import { 
  useCardAnimation, 
  useFavoriteAnimation, 
  useCardPressAnimation 
} from '../../hooks';
import { useSwipeActions } from '../../hooks';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface OportunidadCardProps {
  oportunidad: Oportunidad;
  onPress: () => void;
  onFavorite: () => void;
  isFavorite: boolean;
  index?: number; // Para animación escalonada
  onArchive?: () => void; // Opcional: archivar con swipe
  enableSwipe?: boolean; // Habilitar swipe gestures
}

export const OportunidadCard: React.FC<OportunidadCardProps> = ({
  oportunidad,
  onPress,
  onFavorite,
  isFavorite,
  index = 0,
  onArchive,
  enableSwipe = false,
}) => {
  const { colors } = useThemeColors();
  const [isFavoritePressed, setIsFavoritePressed] = React.useState(false);

  const cardAnimation = useCardAnimation(index);
  const { animateFavorite, style: favoriteStyle } = useFavoriteAnimation();
  const { scale, onPressIn, onPressOut } = useCardPressAnimation();
  
  const swipeGesture = useSwipeActions(
    onArchive, // left action (archivar)
    undefined, // right action (no usado)
    enableSwipe && !!onArchive
  );

  const handleCardPress = () => {
    if (!isFavoritePressed) {
      onPress();
    }
    setIsFavoritePressed(false);
  };

  const handleFavoritePress = (e: any) => {
    setIsFavoritePressed(true);
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    animateFavorite(!isFavorite);
    onFavorite();
  };

  const getStatusColor = () => {
    switch (oportunidad.status) {
      case 'open':
        return '#51CF66';
      case 'waitlist':
        return '#FFA94D';
      case 'closed':
        return '#ADB5BD';
      case 'finished':
        return '#FF6B6B';
      default:
        return colors.primary;
    }
  };

  const getStatusLabel = () => {
    switch (oportunidad.status) {
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

  const getCategoriaInfo = () => {
    return CATEGORIAS.find((cat) => cat.key === oportunidad.categoria) || CATEGORIAS[0];
  };

  const formatDeadline = () => {
    try {
      const date = oportunidad.deadline ? new Date(oportunidad.deadline) : null;
      if (!date || isNaN(date.getTime())) return 'Fecha no disponible';
      return format(date, "d 'de' MMMM", { locale: es });
    } catch {
      return 'Fecha no disponible';
    }
  };

  const categoriaInfo = getCategoriaInfo();

  return (
    <View style={{ position: 'relative' }}>
      {/* Fondo de acción de swipe (si está habilitado) */}
      {enableSwipe && onArchive && (
        <Animated.View
          style={[
            styles.swipeBackground,
            {
              backgroundColor: '#EF4444',
              opacity: swipeGesture.leftActionOpacity,
            },
          ]}
        >
          <Animated.View
            style={{
              transform: [{ scale: swipeGesture.leftActionScale }],
            }}
          >
            <Ionicons name="archive" size={32} color="#fff" />
          </Animated.View>
          <Text style={styles.swipeText}>Archivar</Text>
        </Animated.View>
      )}

      <Animated.View
        style={[
          cardAnimation,
          enableSwipe && onArchive ? { transform: [{ translateX: swipeGesture.translateX }] } : {},
        ]}
        {...(enableSwipe && onArchive ? swipeGesture.panResponder : {})}
      >
        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, transform: [{ scale }] }]}
          onPress={handleCardPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={1}
        >
      {/* Cover Image */}
      <View style={styles.coverContainer}>
        {oportunidad.cover ? (
          <Image source={{ uri: oportunidad.cover }} style={styles.cover} resizeMode="cover" />
        ) : (
          <View style={[styles.coverPlaceholder, { backgroundColor: categoriaInfo.color + '30' }]}>
            <Ionicons name={categoriaInfo.icon as any} size={48} color={categoriaInfo.color} />
          </View>
        )}

        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusLabel()}</Text>
        </View>

        {/* Favorite Button */}
        <Animated.View style={favoriteStyle}>
          <TouchableOpacity
            style={[styles.favoriteButton, { backgroundColor: colors.surface }]}
            onPress={handleFavoritePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? '#FF6B6B' : colors.subtitle}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Category Badge */}
        <View style={[styles.categoryBadge, { backgroundColor: categoriaInfo.color }]}>
          <Ionicons name={categoriaInfo.icon as any} size={12} color="#fff" />
          <Text style={styles.categoryText}>{categoriaInfo.label}</Text>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {oportunidad.titulo}
        </Text>

        {/* Organization */}
        <Text style={[styles.organization, { color: colors.primary }]} numberOfLines={1}>
          {oportunidad.organizacion}
        </Text>

        {/* Description */}
        <Text style={[styles.description, { color: colors.subtitle }]} numberOfLines={3}>
          {oportunidad.descripcion}
        </Text>

        {/* Info Rows */}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={14} color={colors.subtitle} />
            <Text style={[styles.infoText, { color: colors.subtitle }]} numberOfLines={1}>
              {oportunidad.ubicacion?.direccion || oportunidad.ciudad}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={14} color={colors.subtitle} />
            <Text style={[styles.infoText, { color: colors.subtitle }]}>
              Hasta {formatDeadline()}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="people" size={14} color={colors.subtitle} />
            <Text style={[styles.infoText, { color: colors.subtitle }]}>
              {oportunidad.cuposDisponibles} cupos disponibles
            </Text>
          </View>
        </View>

        {/* Modalidad Badge */}
        <View style={[styles.modalidadBadge, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons
            name={
              oportunidad.modalidad === 'presencial'
                ? 'location'
                : oportunidad.modalidad === 'remoto'
                ? 'laptop'
                : 'git-merge'
            }
            size={14}
            color={colors.primary}
          />
          <Text style={[styles.modalidadText, { color: colors.primary }]}>
            {oportunidad.modalidad.charAt(0).toUpperCase() + oportunidad.modalidad.slice(1)}
          </Text>
        </View>
      </View>
      </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  coverContainer: {
    height: 180,
    position: 'relative',
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  favoriteButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  content: {
    padding: 16,
    gap: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  categoryText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  organization: {
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoContainer: {
    gap: 6,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    flex: 1,
  },
  modalidadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    marginTop: 4,
  },
  modalidadText: {
    fontSize: 12,
    fontWeight: '600',
  },
  swipeBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 16,
    width: 120,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  swipeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
});
