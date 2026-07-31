/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import React, { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { ui } from '../../theme/ui';
import type { SortOption } from '../../hooks/useNoteFilters';

export type SortPickerOption = {
  key: SortOption;
  label: string;
  description?: string;
};

type SortPickerSheetProps = {
  visible: boolean;
  selected: SortOption;
  options: SortPickerOption[];
  onSelect: (option: SortOption) => void;
  onClose: () => void;
};

const SortPickerSheet = ({
  visible,
  selected,
  options,
  onSelect,
  onClose,
}: SortPickerSheetProps) => {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: colors.overlay,
        },
        safeArea: {
          maxHeight: '55%',
        },
        sheet: {
          backgroundColor: colors.background,
          borderTopLeftRadius: ui.radius.lg,
          borderTopRightRadius: ui.radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          borderBottomWidth: 0,
          paddingBottom: ui.spacing.md,
        },
        handle: {
          alignSelf: 'center',
          width: 40,
          height: 4,
          borderRadius: 2,
          backgroundColor: colors.border,
          marginTop: 10,
          marginBottom: 6,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: ui.spacing.md,
          paddingVertical: ui.spacing.sm,
        },
        title: {
          fontSize: 18,
          fontWeight: '700',
          color: colors.textPrimary,
        },
        closeButton: {
          paddingVertical: 6,
          paddingHorizontal: 4,
        },
        closeText: {
          fontSize: 15,
          fontWeight: '700',
          color: colors.primaryDark,
        },
        option: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: ui.spacing.md,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        optionSelected: {
          backgroundColor: colors.surfaceSoft,
        },
        optionBody: {
          flex: 1,
        },
        optionLabel: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.textPrimary,
        },
        optionLabelSelected: {
          color: colors.primaryDark,
        },
        optionDescription: {
          ...ui.typography.body,
          fontSize: 13,
          color: colors.textMuted,
          marginTop: 2,
        },
      }),
    [colors],
  );

  const handleSelect = (option: SortOption) => {
    onSelect(option);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
        accessibilityLabel="Close sort options"
      >
        <SafeAreaView style={styles.safeArea}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <View style={styles.header}>
                <Text style={styles.title}>Sort by</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                >
                  <Text style={styles.closeText}>Done</Text>
                </TouchableOpacity>
              </View>
              {options.map((option) => {
                const isSelected = selected === option.key;
                return (
                  <TouchableOpacity
                    key={option.key}
                    style={[styles.option, isSelected && styles.optionSelected]}
                    onPress={() => handleSelect(option.key)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={option.label}
                  >
                    <View style={styles.optionBody}>
                      <Text
                        style={[
                          styles.optionLabel,
                          isSelected && styles.optionLabelSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                      {option.description ? (
                        <Text style={styles.optionDescription}>
                          {option.description}
                        </Text>
                      ) : null}
                    </View>
                    {isSelected ? (
                      <MaterialCommunityIcons
                        name="check"
                        size={22}
                        color={colors.primaryDark}
                      />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableOpacity>
        </SafeAreaView>
      </TouchableOpacity>
    </Modal>
  );
};

export default SortPickerSheet;
