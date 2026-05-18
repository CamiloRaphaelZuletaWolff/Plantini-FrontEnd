import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';

import {
  useThemeColors,
  useUserProfile,
  usePostulaciones,
  useFavoriteOportunidades,
} from '../../../../src/hooks';
import type { ThemeColors } from '../../../theme/colors';

// Componentes modulares
import {
  ProfileHeaderWithBackground,
  ProfileStats,
  ActivitySection,
  FavoritesSection,
  ProfileEditModal,
  AchievementModal,
  type Achievement
} from '../../../../src/components/profile';

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingBottom: 24,
    },
    headerContainer: {
      marginBottom: 24, // Espacio adicional después del header
    },
  });

const ProfileScreen = () => {
  const { colors } = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  
  const { user: profile, updateProfile, toggleFavorito } = useUserProfile();
  const { postulaciones, loading: postulacionesLoading } = usePostulaciones();
  const { favoriteOportunidades, loading: favoritesLoading, count: favoritesCount } = useFavoriteOportunidades();


  const [modalVisible, setModalVisible] = useState(false);
  const [achievementModalVisible, setAchievementModalVisible] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

 
  const horasTotales = postulaciones.filter(p => p.status === 'accepted').length * 2;
  const eventosProximos = postulaciones.filter(p => p.status === 'pending').length;

  // Achievements data (comentado por ahora)
  const achievements: Achievement[] = [
    {
      id: 1,
      title: 'First Volunteer',
      description: '¡Completaste tu primera actividad de voluntariado!',
      icon: 'heart-circle',
      color: '#FFB4C5',
      iconColor: '#FF6B9D',
    },
  ];

  const handleAchievementPress = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setAchievementModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <ProfileHeaderWithBackground user={profile} onEditPress={() => setModalVisible(true)} />
        </View>
        
        <ProfileStats
          postulacionesCount={postulaciones.length}
          horasTotales={horasTotales}
          eventosProximos={eventosProximos}
        />

        {/* Achievements - Componente modular (comentado)
        <AchievementsList
          achievements={achievements}
          onAchievementPress={handleAchievementPress}
        /> */}

        <ActivitySection 
          postulaciones={postulaciones}
          loading={postulacionesLoading}
        />

        <FavoritesSection
          favoriteOportunidades={favoriteOportunidades}
          favoritesCount={favoritesCount}
          loading={favoritesLoading}
          onToggleFavorite={toggleFavorito}
        />
      </ScrollView>

      <AchievementModal
        visible={achievementModalVisible}
        achievement={selectedAchievement}
        onClose={() => setAchievementModalVisible(false)}
      />

      <ProfileEditModal
        visible={modalVisible}
        profile={profile}
        onClose={() => setModalVisible(false)}
        onSubmit={updateProfile}
      />
    </View>
  );
};

export default ProfileScreen;