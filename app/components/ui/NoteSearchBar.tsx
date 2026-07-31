/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import React, { useMemo } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { ui } from '../../theme/ui';

type NoteSearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
};

const NoteSearchBar = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search notes…',
  style,
}: NoteSearchBarProps) => {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderRadius: ui.radius.md,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: 12,
          minHeight: 44,
        },
        icon: {
          fontSize: 16,
          marginRight: 8,
        },
        input: {
          flex: 1,
          ...ui.typography.body,
          color: colors.textPrimary,
          paddingVertical: 10,
        },
        clearButton: {
          paddingHorizontal: 6,
          paddingVertical: 4,
          marginLeft: 4,
        },
        clearText: {
          fontSize: 18,
          color: colors.textMuted,
          lineHeight: 20,
        },
      }),
    [colors],
  );

  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  return (
    <View
      style={[styles.container, style]}
      accessibilityRole="search"
      accessibilityLabel="Search notes"
    >
      <Text style={styles.icon} accessibilityElementsHidden>
        🔍
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="never"
        accessibilityLabel="Search notes"
      />
      {value.length > 0 ? (
        <TouchableOpacity
          onPress={handleClear}
          style={styles.clearButton}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.clearText}>×</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default NoteSearchBar;
