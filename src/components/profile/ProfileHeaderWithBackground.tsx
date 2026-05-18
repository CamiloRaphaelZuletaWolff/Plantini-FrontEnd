import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../../hooks';
import type { User } from '../../types';

const { width } = Dimensions.get('window');

interface ProfileHeaderWithBackgroundProps {
  user: User | null;
  onEditPress?: () => void;
}

export const ProfileHeaderWithBackground: React.FC<ProfileHeaderWithBackgroundProps> = ({ 
  user, 
  onEditPress 
}) => {
  const { colors } = useThemeColors();

  return (
    <View style={styles.container}>
      {/* Background Image Section */}
      <View style={[styles.backgroundContainer, { backgroundColor: colors.surface }]}>
        {user?.backgroundImage ? (
          <Image 
            source={{ uri: user.backgroundImage }} 
            style={styles.backgroundImage}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={[colors.primary + '40', colors.primary + '80']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.backgroundGradient}
          />
        )}
        
        {/* Overlay gradient for better text visibility */}
        <LinearGradient
          colors={['transparent', colors.background + 'E6']}
          style={styles.overlay}
        />
      </View>

      {/* Profile Content */}
      <View style={styles.contentContainer}>
        {/* Profile Image */}
        <View style={[styles.profileImageContainer, { borderColor: colors.surface }]}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profilePlaceholder, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="person" size={64} color={colors.primary} />
            </View>
          )}
        </View>
        
        {/* User Info */}
        <View style={styles.infoContainer}>
          {/* Name */}
          <Text style={[styles.name, { color: colors.text }]}>
            {user?.nombre || 'Usuario'}
          </Text>
          
          {/* Bio */}
          {user?.bio ? (
            <Text style={[styles.bio, { color: colors.subtitle }]} numberOfLines={2}>
              {user.bio}
            </Text>
          ) : (
            <Text style={[styles.bio, { color: colors.muted }]}>
              Mi biografía
            </Text>
          )}

          {/* Academic Info */}
          {(user?.campus || user?.carrera) && (
            <View style={styles.academicInfo}>
              {user?.campus && (
                <View style={styles.infoRow}>
                  <Ionicons name="location" size={16} color={colors.subtitle} />
                  <Text style={[styles.infoText, { color: colors.subtitle }]}>
                    {user.campus}
                  </Text>
                </View>
              )}
              {user?.carrera && (
                <View style={styles.infoRow}>
                  <Ionicons name="school" size={16} color={colors.subtitle} />
                  <Text style={[styles.infoText, { color: colors.subtitle }]}>
                    {user.carrera}
                  </Text>
                </View>
              )}
              {user?.semestre && (
                <View style={styles.infoRow}>
                  <Ionicons name="calendar" size={16} color={colors.subtitle} />
                  <Text style={[styles.infoText, { color: colors.subtitle }]}>
                    Semestre {user.semestre}
                  </Text>
                </View>
              )}
            </View>
          )}
          
          {/* Intereses */}
          {user?.intereses && user.intereses.length > 0 && (
            <View style={styles.interestsPreview}>
              {user.intereses.slice(0, 3).map((interes, index) => (
                <View 
                  key={index}
                  style={[styles.interestTag, { backgroundColor: colors.primary + '20' }]}
                >
                  <Text style={[styles.interestTagText, { color: colors.primary }]}>
                    {interes}
                  </Text>
                </View>
              ))}
              {user.intereses.length > 3 && (
                <Text style={[styles.moreInterests, { color: colors.subtitle }]}>
                  +{user.intereses.length - 3} más
                </Text>
              )}
            </View>
          )}

          {/* Stats Row - Friends count
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>967</Text>
              <Text style={[styles.statLabel, { color: colors.subtitle }]}>amigos</Text>
            </View>
          </View>
           */}
          {/* Edit Button */}
          {onEditPress && (
            <TouchableOpacity 
              style={[styles.editButton, { 
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }]}
              onPress={onEditPress}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={20} color={colors.primary} />
              <Text style={[styles.editButtonText, { color: colors.primary }]}>
                Editar Perfil
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 8,
  },
  backgroundContainer: {
    width: width,
    height: 180,
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  backgroundGradient: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  contentContainer: {
    paddingHorizontal: 20,
    marginTop: -50,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 5,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 16,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profilePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    gap: 12,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  bio: {
    fontSize: 15,
    lineHeight: 20,
  },
  academicInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  interestsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  moreInterests: {
    fontSize: 12,
    fontWeight: '600',
    fontStyle: 'italic',
    alignSelf: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    marginTop: 16,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
