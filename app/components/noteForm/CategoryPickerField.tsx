/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import React, { useMemo } from 'react';
import { View, Platform, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../../theme/ThemeContext';
import { ui } from '../../theme/ui';
import CustomDropdown from '../../screens/CustomDropdown';

type CategoryPickerFieldProps = {
  categories: string[];
  value: string;
  onValueChange: (value: string) => void;
  includePlaceholder?: boolean;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
};

const CategoryPickerField: React.FC<CategoryPickerFieldProps> = ({
  categories,
  value,
  onValueChange,
  includePlaceholder = true,
  placeholder = 'Select an option',
  style,
}) => {
  const { colors } = useTheme();

  const items = useMemo(() => {
    if (includePlaceholder) return [placeholder, ...categories];
    return categories;
  }, [categories, includePlaceholder, placeholder]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        pickerContainer: {
          marginBottom: ui.spacing.md,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderRadius: ui.radius.md,
        },
      }),
    [colors],
  );

  return (
    <View style={style}>
      {Platform.OS === 'ios' ? (
        <CustomDropdown
          selectedValue={value}
          items={items}
          onValueChange={onValueChange}
        />
      ) : (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={value}
            onValueChange={onValueChange}
            style={{ color: colors.textPrimary, fontSize: 16 }}
            accessibilityLabel="Category"
          >
            {items.map((item) => (
              <Picker.Item key={item} label={item} value={item} />
            ))}
          </Picker>
        </View>
      )}
    </View>
  );
};

export default CategoryPickerField;
