/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import React, { useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  StyleProp,
  TextStyle,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { ui } from '../../theme/ui';

type CharCountFieldProps = Omit<TextInputProps, 'style'> & {
  value: string;
  onChangeText: (text: string) => void;
  maxLength: number;
  label?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

const CharCountField: React.FC<CharCountFieldProps> = ({
  value,
  onChangeText,
  maxLength,
  label,
  containerStyle,
  inputStyle,
  ...inputProps
}) => {
  const { colors } = useTheme();
  const nearLimit = value.length >= maxLength - 10;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          marginBottom: ui.spacing.md,
        },
        label: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.textSecondary,
          marginBottom: 6,
        },
        input: {
          fontSize: 16,
          padding: 12,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: ui.radius.md,
          width: '100%',
          backgroundColor: colors.surface,
          color: colors.textPrimary,
        },
        counter: {
          fontSize: 11,
          color: nearLimit ? colors.danger : colors.textMuted,
          textAlign: 'right',
          marginTop: 4,
        },
      }),
    [colors, nearLimit],
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, inputStyle]}
        value={value}
        onChangeText={onChangeText}
        maxLength={maxLength}
        placeholderTextColor={colors.textMuted}
        {...inputProps}
      />
      <Text style={styles.counter} accessibilityLabel={`${value.length} of ${maxLength} characters`}>
        {value.length}/{maxLength}
      </Text>
    </View>
  );
};

export default CharCountField;
