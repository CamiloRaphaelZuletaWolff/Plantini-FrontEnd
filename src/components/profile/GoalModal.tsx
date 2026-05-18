import React, { useState } from 'react';
import {
Modal,
View,
Text,
StyleSheet,
TouchableOpacity,
TextInput,
Animated,
Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks';
import type { ThemeColors } from '../../../app/theme/colors';

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContainer: {
      backgroundColor: colors.background,
      borderRadius: 24,
      width: '100%',
      maxWidth: 380,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 15,
    },
    modalHeader: {
      padding: 24,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      alignItems: 'center',
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    modalSubtitle: {
      fontSize: 15,
      color: colors.subtitle,
      textAlign: 'center',
      lineHeight: 20,
    },
    modalContent: {
      padding: 24,
    },
    label: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 20,
    },
    decrementButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    input: {
      fontSize: 36,
      fontWeight: '700',
      color: colors.primary,
      textAlign: 'center',
      minWidth: 80,
      marginHorizontal: 20,
      paddingVertical: 8,
      borderBottomWidth: 2,
      borderBottomColor: colors.primary + '30',
    },
    incrementButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    hintText: {
      fontSize: 13,
      color: colors.subtitle,
      textAlign: 'center',
      marginTop: 8,
    },
    modalActions: {
      flexDirection: 'row',
      padding: 16,
      paddingTop: 0,
      gap: 12,
    },
    button: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButton: {
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    saveButton: {
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: colors.text,
    },
    saveButtonText: {
      color: '#ffffff',
    },
    disabledButton: {
      opacity: 0.5,
    },
  });

interface GoalModalProps {
  visible: boolean;
  currentGoal: number;
  onSave: (newGoal: number) => void;
  onCancel: () => void;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  visible,
  currentGoal,
  onSave,
  onCancel,
}) => {
  const { colors } = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [goal, setGoal] = useState(currentGoal.toString());
  const [scaleAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      setGoal(currentGoal.toString());
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible, currentGoal]);

  const goalNumber = parseInt(goal) || 0;

  const handleIncrement = () => {
    const newGoal = goalNumber + 1;
    if (newGoal <= 30) {
      setGoal(newGoal.toString());
    }
  };

  const handleDecrement = () => {
    const newGoal = goalNumber - 1;
    if (newGoal >= 1) {
      setGoal(newGoal.toString());
    }
  };

  const handleSave = () => {
    if (goalNumber >= 1 && goalNumber <= 30) {
      onSave(goalNumber);
      Keyboard.dismiss();
    }
  };

  const isValidGoal = goalNumber >= 1 && goalNumber <= 30;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          activeOpacity={1}
          onPress={onCancel}
        />
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="flag" size={32} color={colors.primary} />
            </View>
            <Text style={styles.modalTitle}>Establece tu Meta</Text>
            <Text style={styles.modalSubtitle}>
              ¿Cuántos voluntariados quieres completar este mes?
            </Text>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.label}>Meta mensual</Text>

            <View style={styles.inputContainer}>
              <TouchableOpacity
                style={styles.decrementButton}
                onPress={handleDecrement}
                disabled={goalNumber <= 1}
              >
                <Ionicons
                  name="remove"
                  size={24}
                  color={goalNumber <= 1 ? colors.muted : colors.primary}
                />
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                value={goal}
                onChangeText={setGoal}
                keyboardType="number-pad"
                maxLength={2}
                selectTextOnFocus
              />

              <TouchableOpacity
                style={styles.incrementButton}
                onPress={handleIncrement}
                disabled={goalNumber >= 30}
              >
                <Ionicons name="add" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.hintText}>
              {goalNumber === 1
                ? '1 actividad al mes'
                : `${goalNumber} actividades al mes`}
            </Text>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                !isValidGoal && styles.disabledButton,
              ]}
              onPress={handleSave}
              disabled={!isValidGoal}
            >
              <Text style={[styles.buttonText, styles.saveButtonText]}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};
