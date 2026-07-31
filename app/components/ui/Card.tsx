/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { getShadow, ui } from '../../theme/ui';

type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  shadow?: boolean;
};

const Card = ({ children, style, shadow = false }: CardProps) => {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: colors.surface,
          borderRadius: ui.radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          ...(shadow ? getShadow(colors.shadowColor) : {}),
        },
      }),
    [colors, shadow],
  );

  return <View style={[styles.card, style]}>{children}</View>;
};

export default Card;
