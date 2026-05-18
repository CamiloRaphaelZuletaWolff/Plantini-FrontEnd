import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks';
import type { User } from '../../types';

interface ProfileHeaderProps {
  user: User | null;
  onEditPress?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onEditPress }) => {
  const { colors } = useThemeColors();

  return (
    <View style={styles.header}>
      {/* Profile Image */}
      <View style={[styles.profileImageContainer, { borderColor: colors.primary }]}>
        {user?.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.profileImage} />
        ) : (
          <View style={[styles.profilePlaceholder, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="person" size={64} color={colors.primary} />
          </View>
        )}
      </View>
      
      {/* Name */}
      <Text style={[styles.name, { color: colors.text }]}>
        {user?.nombre || 'Usuario'}
      </Text>
      
      {/* Academic Info */}
      {(user?.campus || user?.carrera) && (
        <View style={styles.academicInfo}>
          {user?.campus && (
            <View style={styles.infoRow}>
              <Ionicons name="location" size={16} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                {user.campus}
              </Text>
            </View>
          )}
          {user?.carrera && (
            <View style={styles.infoRow}>
              <Ionicons name="school" size={16} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                {user.carrera}
              </Text>
            </View>
          )}
          {user?.semestre && (
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={16} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                Semestre {user.semestre}
              </Text>
            </View>
          )}
        </View>
      )}
      
      {/* Bio */}
      {user?.bio ? (
        <Text style={[styles.bio, { color: colors.subtitle }]} numberOfLines={3}>
          {user.bio}
        </Text>
      ) : (
        <Text style={[styles.bio, { color: colors.muted }]}>
          No bio yet
        </Text>
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
              +{user.intereses.length - 3} more
            </Text>
          )}
        </View>
      )}
      
      {/* Edit Button */}
      {onEditPress && (
        <TouchableOpacity 
          style={[styles.editButton, { 
            backgroundColor: colors.surface,
            borderColor: colors.border 
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
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 24,
    position: 'relative',
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  academicInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
    flexWrap: 'wrap',
    paddingHorizontal: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 12,
  },
  interestsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    marginBottom: 16,
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
