/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import React, { useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextStyle,
  ViewStyle,
  StyleProp,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeContext';
import { ui } from '../../theme/ui';
import { MIN_TOUCH_TARGET } from '../../utils/accessibility';
import { useReducedMotion } from '../../hooks/useReducedMotion';

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

const AnimatedView = Animated.createAnimatedComponent(View);

const CategoryChipRow = ({
  chips,
  selectedKey,
  onSelect,
  style,
}: CategoryChipRowProps) => {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();

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
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: ui.radius.pill,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: 12,
          paddingVertical: 8,
          marginRight: 6,
          minHeight: MIN_TOUCH_TARGET,
          overflow: 'hidden',
        },
        chipInner: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
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
          lineHeight: 16,
          fontWeight: '600',
        } as TextStyle,
        chipTextSelected: {
          color: colors.primaryDark,
          fontWeight: '700',
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
        {chips.map((chip) => (
          <ChipItem
            key={chip.key}
            chip={chip}
            isSelected={selectedKey === chip.key}
            onSelect={onSelect}
            styles={styles}
            reduceMotion={reduceMotion}
          />
        ))}
      </ScrollView>
    </View>
  );
};

type ChipItemProps = {
  chip: CategoryChip;
  isSelected: boolean;
  onSelect: (key: string) => void;
  styles: ReturnType<typeof StyleSheet.create>;
  reduceMotion: boolean;
};

const ChipItem = ({
  chip,
  isSelected,
  onSelect,
  styles,
  reduceMotion,
}: ChipItemProps) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) {
      scale.value = 1;
      return;
    }
    scale.value = withSpring(isSelected ? 1.04 : 1, {
      damping: 16,
      stiffness: 280,
      mass: 0.6,
    });
  }, [isSelected, reduceMotion, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const label =
    chip.count !== undefined
      ? `${chip.label} (${chip.count})`
      : chip.label;

  return (
    <TouchableOpacity
      style={[styles.chip, isSelected && styles.chipSelected]}
      onPress={() => onSelect(chip.key)}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={label}
      activeOpacity={0.75}
    >
      <AnimatedView style={[styles.chipInner, animatedStyle]}>
        {chip.dotColor ? (
          <View
            style={[styles.dot, { backgroundColor: chip.dotColor }]}
          />
        ) : null}
        <Text
          includeFontPadding={false}
          style={[
            styles.chipText,
            isSelected && styles.chipTextSelected,
            Platform.OS === 'android' && { textAlignVertical: 'center' },
          ]}
        >
          {label}
        </Text>
      </AnimatedView>
    </TouchableOpacity>
  );
};

export default CategoryChipRow;
