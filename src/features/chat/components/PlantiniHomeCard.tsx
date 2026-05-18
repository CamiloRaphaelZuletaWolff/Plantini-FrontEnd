import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../../../../src/hooks';

export const PlantiniHomeCard: React.FC = () => {
  const { colors } = useThemeColors();
  const router = useRouter();
  const styles = createStyles(colors);

  return (
    <View style={styles.card} accessible accessibilityLabel="Plantini card">
      <Image source={require('../../../../assets/Plantini/plantini.png')} style={styles.avatar} />
      <View style={styles.body}>
  <Text style={styles.title}>Hola, soy Plantini</Text>
  <Text style={styles.subtitle}>Soy el asistente de VoluntariadoUPB. Solo respondo consultas relacionadas con oportunidades, postulaciones, perfiles y permisos dentro de la app.</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/(drawer)/chat') }>
        <Text style={{ color: '#fff', fontWeight: '600' }}>Abrir chat</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    card: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: colors.surface, borderRadius: 12, marginHorizontal: 24, marginBottom: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
    avatar: { width: 56, height: 56, borderRadius: 28, marginRight: 12 },
    body: { flex: 1 },
    title: { fontWeight: '700', color: colors.text },
    subtitle: { color: colors.muted, marginTop: 4, fontSize: 13 },
    button: { backgroundColor: colors.primary, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  });
