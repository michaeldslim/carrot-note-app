/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { ui } from '../../theme/ui';

export type SegmentOption<T extends string> = {
  key: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
};

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  style,
}: SegmentedControlProps<T>) {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        track: {
          flexDirection: 'row',
          backgroundColor: colors.surfaceSoft,
          borderRadius: ui.radius.pill,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 3,
        },
        segment: {
          flex: 1,
          paddingVertical: 8,
          paddingHorizontal: 4,
          borderRadius: ui.radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 36,
        },
        segmentSelected: {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.primary,
        },
        label: {
          fontSize: 13,
          fontWeight: '600',
          color: colors.textSecondary,
        },
        labelSelected: {
          color: colors.primaryDark,
          fontWeight: '700',
        },
      }),
    [colors],
  );

  return (
    <View style={[styles.track, style]} accessibilityRole="tablist">
      {options.map((option) => {
        const isSelected = value === option.key;
        return (
          <TouchableOpacity
            key={option.key}
            style={[styles.segment, isSelected && styles.segmentSelected]}
            onPress={() => onChange(option.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={option.label}
          >
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default SegmentedControl;
