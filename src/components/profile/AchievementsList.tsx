import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks';

export interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  iconColor: string;
  count?: number;
}

interface AchievementsListProps {
  achievements: Achievement[];
  onAchievementPress: (achievement: Achievement) => void;
}

export const AchievementsList: React.FC<AchievementsListProps> = ({
  achievements,
  onAchievementPress,
}) => {
  const { colors } = useThemeColors();

  const renderAchievement = ({ item }: { item: Achievement }) => (
    <TouchableOpacity
      style={[styles.achievementCard, { backgroundColor: colors.surface }]}
      onPress={() => onAchievementPress(item)}
    >
      <View style={[styles.achievementBadge, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon as any} size={32} color={item.iconColor} />
        {item.count && (
          <View style={styles.achievementBadgeCount}>
            <Text style={styles.achievementBadgeCountText}>x{item.count}</Text>
          </View>
        )}
      </View>
      <View style={styles.achievementInfo}>
        <Text style={[styles.achievementTitle, { color: colors.text }]}>
          {item.title}
        </Text>
        <Text
          style={[styles.achievementDescription, { color: colors.subtitle }]}
          numberOfLines={2}
        >
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        🏆 Logros
      </Text>
      <FlatList
        data={achievements}
        renderItem={renderAchievement}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.achievementsList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  achievementsList: {
    paddingHorizontal: 24,
    gap: 12,
  },
  achievementCard: {
    width: 280,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  achievementBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  achievementBadgeCount: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  achievementBadgeCountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  achievementInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
});
