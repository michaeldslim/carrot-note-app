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
  ViewStyle,
  StyleProp,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { ui } from '../../theme/ui';
import Card from './Card';

type EmptyStateAction = {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
};

type EmptyStateProps = {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  title?: string;
  subtitle?: string;
  action?: EmptyStateAction;
  /** `card` wraps content in a bordered surface; `plain` centers without a card shell. */
  variant?: 'card' | 'plain';
  style?: StyleProp<ViewStyle>;
};

const EmptyState = ({
  icon,
  title,
  subtitle,
  action,
  variant = 'card',
  style,
}: EmptyStateProps) => {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        cardContent: {
          padding: ui.spacing.xl,
          alignItems: 'center',
        },
        plainContent: {
          alignItems: 'center',
          paddingTop: 40,
          paddingHorizontal: ui.spacing.xl,
        },
        icon: {
          marginBottom: ui.spacing.sm,
        },
        title: {
          color: colors.textPrimary,
          fontSize: 18,
          fontWeight: '700',
          marginBottom: 4,
          textAlign: 'center',
        },
        subtitle: {
          color: colors.textSecondary,
          fontSize: 14,
          textAlign: 'center',
          lineHeight: 20,
          marginBottom: action ? ui.spacing.md : 0,
        },
        plainSubtitle: {
          color: colors.textMuted,
        },
        actionButton: {
          paddingHorizontal: 18,
          paddingVertical: 10,
          borderRadius: ui.radius.pill,
          backgroundColor: colors.primary,
        },
        actionButtonText: {
          color: colors.surface,
          fontSize: 14,
          fontWeight: '700',
        },
      }),
    [colors, action],
  );

  const content = (
    <>
      {icon ? (
        <MaterialCommunityIcons
          name={icon}
          size={variant === 'plain' ? 48 : 40}
          color={colors.textMuted}
          style={styles.icon}
        />
      ) : null}
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? (
        <Text
          style={[styles.subtitle, variant === 'plain' && styles.plainSubtitle]}
        >
          {subtitle}
        </Text>
      ) : null}
      {action ? (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={action.onPress}
          accessibilityLabel={action.accessibilityLabel ?? action.label}
        >
          <Text style={styles.actionButtonText}>{action.label}</Text>
        </TouchableOpacity>
      ) : null}
    </>
  );

  if (variant === 'plain') {
    return (
      <View style={[styles.plainContent, style]}>
        {content}
      </View>
    );
  }

  return (
    <Card style={[{ marginTop: 10 }, style]}>
      <View style={styles.cardContent}>{content}</View>
    </Card>
  );
};

export default EmptyState;
