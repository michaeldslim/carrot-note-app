/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { ui } from '../../theme/ui';
import { MIN_TOUCH_TARGET } from '../../utils/accessibility';

export type HeaderAction = {
  key: string;
  onPress: () => void;
  accessibilityLabel: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  label?: string;
};

type ScreenHeaderActionsProps = {
  actions: HeaderAction[];
};

const ScreenHeaderActions = ({ actions }: ScreenHeaderActionsProps) => {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        },
        button: {
          paddingHorizontal: 10,
          paddingVertical: 7,
          minHeight: MIN_TOUCH_TARGET,
          minWidth: MIN_TOUCH_TARGET,
          backgroundColor: colors.surfaceSoft,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: ui.radius.pill,
          justifyContent: 'center',
          alignItems: 'center',
        },
        buttonWithLabel: {
          paddingHorizontal: 12,
        },
        label: {
          color: colors.primaryDark,
          fontSize: 13,
          fontWeight: '700',
        },
      }),
    [colors],
  );

  return (
    <View style={styles.row}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.key}
          onPress={action.onPress}
          style={[
            styles.button,
            action.label ? styles.buttonWithLabel : undefined,
          ]}
          accessibilityLabel={action.accessibilityLabel}
        >
          {action.icon ? (
            <MaterialCommunityIcons
              name={action.icon}
              size={action.label ? 16 : 18}
              color={colors.primaryDark}
            />
          ) : null}
          {action.label ? (
            <Text style={styles.label}>{action.label}</Text>
          ) : null}
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default ScreenHeaderActions;
