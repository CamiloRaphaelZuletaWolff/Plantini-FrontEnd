import React, { useState } from 'react';
import { Link, Stack, useRouter } from 'expo-router';
import { 
StyleSheet, 
Text, 
View, 
TouchableOpacity, 
ScrollView, 
Image, 
ImageBackground,
Dimensions,
FlatList,
ActivityIndicator,
Linking,
Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors, useUserStats, useUserGoal } from '../../../src/hooks';
import { GoalModal } from '../../../src/components';
import type { ThemeColors } from '../../theme/colors';
import { PlantiniHomeCard } from '../../../src/features/chat/components/PlantiniHomeCard';

const { width: screenWidth } = Dimensions.get('window');

const createStyles = (colors: ThemeColors) =>
StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: colors.background,
    },
    scrollContent: {
    paddingBottom: 24,
    },
    welcomeSection: {
    padding: 24,
    marginBottom: 16,
    },
    title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    },
    subtitle: {
    fontSize: 16,
    color: colors.subtitle,
    lineHeight: 22,
    },
    sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    },
    bannerSection: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    height: 180,
    },
    bannerBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    },
    bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primary + 'CC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    },
    bannerText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 34,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    },
    bannerSubtext: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.95,
    },
    progressSection: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    },
    progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    },
    progressIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    },
    progressTextContainer: {
    flex: 1,
    },
    progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    },
    progressSubtitle: {
    fontSize: 14,
    color: colors.subtitle,
    },
    progressBar: {
    height: 8,
    backgroundColor: colors.muted + '30',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 12,
    },
    progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
    },
    nextActivitySection: {
    marginHorizontal: 24,
    marginBottom: 24,
    },
    nextActivityCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    },
    nextActivityIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    },
    nextActivityContent: {
    flex: 1,
    },
    nextActivityLabel: {
    fontSize: 12,
    color: colors.subtitle,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
    },
    nextActivityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    },
    nextActivityTime: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    },
    carouselSection: {
    marginBottom: 32,
    },
    carouselHeader: {
    paddingHorizontal: 24,
    marginBottom: 20,
    },
    carouselTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
    },
    carouselContainer: {
    height: 280,
    },
    carouselItem: {
    width: screenWidth - 48,
    marginHorizontal: 24,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#00b5ad',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    },
    carouselImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    },
    carouselPagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
    },
    paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.muted,
    },
    paginationDotActive: {
    backgroundColor: colors.primary,
    },
    coordinatorSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
    },
    coordinatorCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    },
    coordinatorImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    backgroundColor: colors.muted,
    },
    coordinatorName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
    },
    coordinatorTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
    marginBottom: 12,
    textAlign: 'center',
    },
    coordinatorContactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    },
    coordinatorContactText: {
    fontSize: 14,
    color: colors.subtitle,
    marginLeft: 8,
    },
    contactButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    width: '100%',
    },
    contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    },
    contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    },
});

type CarouselImageSource = ReturnType<typeof require>;

const InicioScreen = () => {
const { colors } = useThemeColors();
const styles = React.useMemo(() => createStyles(colors), [colors]);
const router = useRouter();
const [currentImageIndex, setCurrentImageIndex] = useState(0);
const [goalModalVisible, setGoalModalVisible] = useState(false);

// Obtener y gestionar la meta del usuario
const { monthlyGoal, updateMonthlyGoal, loading: goalLoading } = useUserGoal();

// Obtener estadísticas reales del usuario
const { completedActivities, nextActivity, loading } = useUserStats(monthlyGoal);

const handleUpdateGoal = async (newGoal: number) => {
    const success = await updateMonthlyGoal(newGoal);
    if (success) {
    setGoalModalVisible(false);
    }
};

const handleNavigateToOportunidad = () => {
    if (nextActivity) {
    // Navegar primero al tab de oportunidades, luego al detalle
    router.push('/(drawer)/(tabs)/opportunities');
    // Pequeño delay para asegurar que el tab cambió
    setTimeout(() => {
        router.push(`/(drawer)/(tabs)/opportunities/${nextActivity.id}` as any);
    }, 100);
    }
};

const handleOpenWhatsApp = async () => {
    const phoneNumber = '59177520037'; 
    const url = `whatsapp://send?phone=${phoneNumber}`;
    
    try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
        await Linking.openURL(url);
    } else {
        Alert.alert('Error', 'WhatsApp no está instalado en este dispositivo');
    }
    } catch (error) {
    Alert.alert('Error', 'No se pudo abrir WhatsApp');
    }
};

const handleOpenInstagram = async () => {
    const instagramUrl = 'https://www.instagram.com/studentlife_upblpz/';
    
    try {
    const supported = await Linking.canOpenURL(instagramUrl);
    if (supported) {
        await Linking.openURL(instagramUrl);
    } else {
        Alert.alert('Error', 'No se pudo abrir Instagram');
    }
    } catch (error) {
    Alert.alert('Error', 'No se pudo abrir el enlace');
    }
};

const carouselImages: CarouselImageSource[] = [
    require('../../../assets/Mensaje/Mensaje1.jpeg'),
    require('../../../assets/Mensaje/Mensaje2.jpeg'),
    require('../../../assets/Mensaje/Mensaje3.jpeg'),
    require('../../../assets/Mensaje/Mensaje4.jpeg'),
    require('../../../assets/Mensaje/Mensaje5.jpeg'),
    require('../../../assets/Mensaje/Mensaje6.jpeg'),
    require('../../../assets/Mensaje/Mensaje7.jpeg'),
    require('../../../assets/Mensaje/Mensaje8.jpeg'),
    require('../../../assets/Mensaje/Mensaje9.jpeg'),
];

const renderCarouselItem = ({ item, index }: { item: CarouselImageSource; index: number }) => (
    <View style={styles.carouselItem}>
    <Image source={item} style={styles.carouselImage} />
    </View>
);

const onCarouselScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const slideSize = screenWidth - 48;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentImageIndex(index);
};

return (
    <View style={styles.container}>
    <Stack.Screen options={{ title: 'Inicio' }} />
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
        <Text style={styles.title}>¡Hola!</Text>
        <Text style={styles.subtitle}>
            Bienvenido a Voluntariado UPB. Encuentra oportunidades para contribuir 
            a tu comunidad universitaria y desarrollar nuevas habilidades.
        </Text>
        </View>

    {/* Plantini card */}
    <PlantiniHomeCard />

    {/* Inspirational Banner Section */}
        <View style={styles.bannerSection}>
        <ImageBackground
            source={require('../../../assets/Voluntariado.png')}
            style={styles.bannerBackground}
            resizeMode="cover"
        >
            <View style={styles.bannerOverlay}>
            <Text style={styles.bannerText}>Pequeñas acciones{'\n'}grandes cambios</Text>
            <Text style={styles.bannerSubtext}>Gracias por ser parte del cambio </Text>
            </View>
        </ImageBackground>
        </View>

        {/* Personal Progress Section */}
        <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
            <View style={styles.progressIcon}>
            <Ionicons name="trophy" size={24} color={colors.primary} />
            </View>
            <View style={styles.progressTextContainer}>
            {loading || goalLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
            ) : (
                <>
                <Text style={styles.progressTitle}>
                    Has participado en {completedActivities} voluntariado{completedActivities !== 1 ? 's' : ''} este mes 
                </Text>
                <TouchableOpacity onPress={() => setGoalModalVisible(true)}>
                    <Text style={[styles.progressSubtitle, { textDecorationLine: 'underline' }]}>
                    Meta: {monthlyGoal} actividades · Editar
                    </Text>
                </TouchableOpacity>
                </>
            )}
            </View>
        </View>
        {!loading && !goalLoading && (
            <View style={styles.progressBar}>
            <View 
                style={[
                styles.progressBarFill, 
                { width: `${Math.min((completedActivities / monthlyGoal) * 100, 100)}%` }
                ]} 
            />
            </View>
        )}
        </View>

        {/* Next Activity Section */}
        {!loading && nextActivity ? (
        <View style={styles.nextActivitySection}>
            <Text style={styles.sectionTitle}>Próxima Oportunidad</Text>
            <TouchableOpacity 
            style={styles.nextActivityCard}
            onPress={handleNavigateToOportunidad}
            activeOpacity={0.7}
            >
            <View style={styles.nextActivityIcon}>
                <Ionicons name="calendar" size={28} color={colors.primary} />
            </View>
            <View style={styles.nextActivityContent}>
                <Text style={styles.nextActivityLabel}>{nextActivity.organizacion}</Text>
                <Text style={styles.nextActivityTitle} numberOfLines={2}>{nextActivity.titulo}</Text>
                <Text style={styles.nextActivityTime}>
                Fecha límite en {nextActivity.daysUntil} día{nextActivity.daysUntil !== 1 ? 's' : ''}
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.subtitle} />
            </TouchableOpacity>
        </View>
        ) : !loading && (
        <View style={styles.nextActivitySection}>
            <Text style={styles.sectionTitle}>Próxima Oportunidad</Text>
            <View style={styles.nextActivityCard}>
            <View style={styles.nextActivityIcon}>
                <Ionicons name="calendar-outline" size={28} color={colors.subtitle} />
            </View>
            <View style={styles.nextActivityContent}>
                <Text style={styles.nextActivityLabel}>Sin oportunidades disponibles</Text>
                <Text style={[styles.progressSubtitle, { marginTop: 4 }]}>
                No hay oportunidades próximas en este momento
                </Text>
            </View>
            </View>
        </View>
        )}

        {/* Carousel Section */}
        <View style={styles.carouselSection}>
        <View style={styles.carouselHeader}>
            <Text style={styles.carouselTitle}>Impacto del Voluntariado</Text>
        </View>
        
        <FlatList
            data={carouselImages}
            renderItem={renderCarouselItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onCarouselScroll}
            style={styles.carouselContainer}
        />
        
        <View style={styles.carouselPagination}>
            {carouselImages.map((_, index) => (
            <View
                key={index}
                style={[
                styles.paginationDot,
                index === currentImageIndex && styles.paginationDotActive,
                ]}
            />
            ))}
        </View>
        </View>

        {/* Coordinator Section */}
        <View style={styles.coordinatorSection}>
        <Text style={styles.sectionTitle}>Coordinadora</Text>
        <View style={styles.coordinatorCard}>
            <Image 
            source={require('../../../assets/Coordinadoraa.png')} 
            style={styles.coordinatorImage}
            />
            <Text style={styles.coordinatorName}>Paola López</Text>
            <Text style={styles.coordinatorTitle}>
            Coordinadora de Voluntariados{'\n'}y Responsabilidad Social
            </Text>
            
            <View style={styles.coordinatorContactContainer}>
            <Ionicons name="mail-outline" size={16} color={colors.primary} />
            <Text style={styles.coordinatorContactText}>paolalopez@upb.edu</Text>
            </View>
            
            {/* Contact Buttons */}
            <View style={styles.contactButtonsContainer}>
            <TouchableOpacity 
                style={[styles.contactButton, { backgroundColor: '#25D366' }]}
                onPress={handleOpenWhatsApp}
            >
                <Ionicons name="logo-whatsapp" size={24} color="#ffffff" />
                <Text style={styles.contactButtonText}>WhatsApp</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={[styles.contactButton, { backgroundColor: '#E4405F' }]}
                onPress={handleOpenInstagram}
            >
                <Ionicons name="logo-instagram" size={24} color="#ffffff" />
                <Text style={styles.contactButtonText}>Instagram</Text>
            </TouchableOpacity>
            </View>
        </View>
        </View>
    </ScrollView>

      {/* Goal Modal */}
    <GoalModal
        visible={goalModalVisible}
        currentGoal={monthlyGoal}
        onSave={handleUpdateGoal}
        onCancel={() => setGoalModalVisible(false)}
    />
    </View>
);
};

export default InicioScreen;
