/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import React, { useMemo } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { ui } from '../../theme/ui';

type LoadingStateProps = {
  message?: string;
  /** When true (default), fills available space. When false, uses compact padding for inline use. */
  fill?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

const LoadingState = ({
  message,
  fill = true,
  style,
  children,
}: LoadingStateProps) => {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
          ...(fill ? { flex: 1 } : { paddingVertical: ui.spacing.xl }),
        },
        message: {
          marginTop: ui.spacing.md,
          color: colors.textSecondary,
          fontSize: 15,
          fontWeight: '600',
        },
      }),
    [colors, fill],
  );

  return (
    <View style={[styles.container, style]}>
      {children}
      <ActivityIndicator size="large" color={colors.primary} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

export default LoadingState;
