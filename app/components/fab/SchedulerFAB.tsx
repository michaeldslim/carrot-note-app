/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import React from 'react';
import { StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';
import { useTheme } from '../../theme/ThemeContext';

interface SchedulerFABProps {
  onPress: () => void;
}

const SchedulerFAB: React.FC<SchedulerFABProps> = ({ onPress }) => {
  const { colors } = useTheme();

  return (
    <FAB
      icon="plus"
      onPress={onPress}
      style={[styles.fab, { backgroundColor: colors.primary }]}
      color={colors.surface}
      accessibilityLabel="Add new event"
    />
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 32,
    borderRadius: 999,
  },
});

export default SchedulerFAB;
