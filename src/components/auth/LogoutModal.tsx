import React from 'react';
import {
View,
Text,
Modal,
TouchableOpacity,
StyleSheet,
Image,
Dimensions,
} from 'react-native';
import { useThemeColors } from '../../hooks';

interface LogoutModalProps {
visible: boolean;
onConfirm: () => void;
onCancel: () => void;
}

const { width } = Dimensions.get('window');

export const LogoutModal: React.FC<LogoutModalProps> = ({ visible, onConfirm, onCancel }) => {
const { colors } = useThemeColors();

return (
    <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onCancel}
    >
    <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.content}>
            <Image
            source={require('../../../assets/Plantini/plantiniCerrarSesion.png')}
            style={styles.plantiniImage}
            resizeMode="contain"
            />

            <View style={styles.messageContainer}>
            <Text style={[styles.title, { color: colors.text }]}>
                Cerrar Sesión
            </Text>
            <Text style={[styles.message, { color: colors.subtitle }]}>
                ¿Estás seguro que deseas cerrar sesión?
            </Text>
            </View>

            <View style={styles.buttonsContainer}>
            
            <TouchableOpacity
                style={[styles.cancelButton, { borderColor: colors.border }]}
                onPress={onCancel}
            >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                Cancelar
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: colors.primary }]}
                onPress={onConfirm}
            >
                <Text style={styles.confirmButtonText}>Cerrar Sesión</Text>
            </TouchableOpacity>
            </View>
        </View>
        </View>
    </View>
    </Modal>
);
};

const styles = StyleSheet.create({
overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
},
modalContainer: {
    width: width * 0.85,
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
    width: 0,
    height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
},
content: {
    padding: 24,
    alignItems: 'center',
},
plantiniImage: {
    width: 120,
    height: 120,
    marginTop: 8,
    marginBottom: 20,
},
messageContainer: {
    alignItems: 'center',
    marginBottom: 24,
},
title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
},
message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
},
buttonsContainer: {
    width: '100%',
    gap: 12,
},
cancelButton: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: 'transparent',
},
cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
},
confirmButton: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
},
confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
},
});
