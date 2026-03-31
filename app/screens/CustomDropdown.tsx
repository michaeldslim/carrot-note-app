/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getShadow, ui } from '../theme/ui';
import { useTheme } from '../theme/ThemeContext';

interface CustomDropdownProps {
  selectedValue: string;
  items: string[];
  onValueChange: (itemValue: string) => void;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  selectedValue,
  items,
  onValueChange,
}) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [temporaryValue, setTemporaryValue] = useState<string>(selectedValue);
  const { colors } = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    button: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 14,
      paddingHorizontal: 12,
      alignItems: 'flex-start',
      marginBottom: ui.spacing.md,
      borderRadius: ui.radius.md,
      ...getShadow(colors.shadowColor),
    },
    buttonText: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.overlay,
    },
    modalContent: {
      width: '88%',
      backgroundColor: colors.surface,
      borderRadius: ui.radius.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    closeButton: {
      backgroundColor: colors.primary,
      paddingVertical: 13,
      alignItems: 'center',
    },
    closeButtonText: {
      color: colors.surface,
      fontSize: 15,
      fontWeight: '700',
    },
  }), [colors]);

  const handleValueChange = (itemValue: string) => {
    setTemporaryValue(itemValue);
  };

  const confirmSelection = () => {
    onValueChange(temporaryValue);
    setModalVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>{selectedValue}</Text>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Picker
              selectedValue={temporaryValue}
              onValueChange={(itemValue, itemIndex) =>
                handleValueChange(itemValue)
              }
            >
              {items.map((item, index) => (
                <Picker.Item key={index} label={item} value={item} />
              ))}
            </Picker>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={confirmSelection}
            >
              <Text style={styles.closeButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CustomDropdown;
