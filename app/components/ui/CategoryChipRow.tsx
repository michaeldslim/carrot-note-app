/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextStyle,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { ui } from '../../theme/ui';

export type CategoryChip = {
  key: string;
  label: string;
  count?: number;
  dotColor?: string;
};

type CategoryChipRowProps = {
  chips: CategoryChip[];
  selectedKey: string;
  onSelect: (key: string) => void;
  style?: StyleProp<ViewStyle>;
};

const CategoryChipRow = ({
  chips,
  selectedKey,
  onSelect,
  style,
}: CategoryChipRowProps) => {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: 4,
        },
        scroll: {
          flexDirection: 'row',
        },
        chip: {
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: ui.radius.pill,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          paddingVertical: 7,
          paddingHorizontal: 10,
          marginRight: 6,
        },
        dot: {
          width: 8,
          height: 8,
          borderRadius: 4,
          marginRight: 6,
        },
        chipSelected: {
          backgroundColor: colors.surfaceSoft,
          borderColor: colors.primary,
        },
        chipText: {
          color: colors.textSecondary,
          fontSize: 14,
          fontWeight: '600',
        } as TextStyle,
        chipTextSelected: {
          color: colors.primaryDark,
        },
      }),
    [colors],
  );

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
      >
        {chips.map((chip) => {
          const isSelected = selectedKey === chip.key;
          const label =
            chip.count !== undefined
              ? `${chip.label} (${chip.count})`
              : chip.label;

          return (
            <TouchableOpacity
              key={chip.key}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => onSelect(chip.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={label}
            >
              {chip.dotColor ? (
                <View
                  style={[styles.dot, { backgroundColor: chip.dotColor }]}
                />
              ) : null}
              <Text
                style={[styles.chipText, isSelected && styles.chipTextSelected]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default CategoryChipRow;
