/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { FIREBASE_AUTH } from '../../../firebaseConfig';
import {
  addCategories,
  fetchCategories,
  updateCategory,
  deleteCategory,
} from '../../service/firebaseService';
import { shadow, ui } from '../../theme/ui';

export const CategoryManager = () => {
  const [newCategory, setNewCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editedCategoryText, setEditedCategoryText] = useState<string>('');
  const userId = FIREBASE_AUTH.currentUser?.uid;

  const loadCategories = useCallback(async () => {
    if (userId) {
      try {
        const fetchedCategories = await fetchCategories(userId);
        setCategories(fetchedCategories);
      } catch (error) {
        if (error instanceof Error) {
          Alert.alert('Error', `Failed to load categories: ${error.message}`);
        } else {
          Alert.alert('Error', 'An unknown error occurred');
        }
      }
    }
  }, [userId]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleAddCategory = async () => {
    const newCategories = newCategory.split(',').map((cat) => cat.trim());
    if (categories.length + newCategories.length > 7) {
      Alert.alert('Error', 'You cannot add more than 7 categories.');
      return;
    }
    try {
      const user = FIREBASE_AUTH.currentUser;
      if (user) {
        await addCategories(user.uid, newCategories);
        Alert.alert('Success', 'Categories added successfully');
        setCategories([...categories, ...newCategories]);
        setNewCategory('');
      } else {
        Alert.alert('Error', 'User not authenticated');
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', `Failed to add categories: ${error.message}`);
      } else {
        Alert.alert('Error', 'An unknown error occurred');
      }
    }
  };

  const handleEditCategory = (category: string) => {
    setEditingCategory(category);
    setEditedCategoryText(category);
  };

  const handleUpdateCategory = async (oldCategory: string) => {
    if (editedCategoryText.trim().length < 2) {
      Alert.alert('Error', 'Category must be at least 2 characters long');
      return;
    }

    if (
      categories.some(
        (cat) =>
          cat.toLowerCase() === editedCategoryText.toLowerCase() &&
          cat.toLowerCase() !== oldCategory.toLowerCase(),
      )
    ) {
      Alert.alert('Error', 'This category already exists');
      return;
    }

    try {
      const user = FIREBASE_AUTH.currentUser;
      if (user) {
        await updateCategory(user.uid, oldCategory, editedCategoryText.trim());
        const updatedCategories = categories
          .map((cat) => (cat === oldCategory ? editedCategoryText.trim() : cat))
          .sort((a, b) => a.localeCompare(b));
        setCategories(updatedCategories);
        setEditingCategory(null);
        setEditedCategoryText('');
        Alert.alert('Success', 'Category updated successfully');
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', `Failed to update category: ${error.message}`);
      } else {
        Alert.alert('Error', 'An unknown error occurred');
      }
    }
  };

  const handleDeleteCategory = async (categoryToDelete: string) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${categoryToDelete}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const user = FIREBASE_AUTH.currentUser;
              if (user) {
                await deleteCategory(user.uid, categoryToDelete);
                const updatedCategories = categories.filter(
                  (cat) => cat !== categoryToDelete,
                );
                setCategories(updatedCategories);
                Alert.alert('Success', 'Category deleted successfully');
              }
            } catch (error) {
              if (error instanceof Error) {
                Alert.alert(
                  'Error',
                  `Failed to delete category: ${error.message}`,
                );
              } else {
                Alert.alert('Error', 'An unknown error occurred');
              }
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.section}>
      <Text style={styles.subtitle}>Add New Category</Text>
      <Text style={styles.instructions}>
        Enter categories separated by commas (e.g., Work, Personal, Shopping)
      </Text>
      <TextInput
        style={styles.input}
        placeholder="New Category"
        value={newCategory}
        onChangeText={setNewCategory}
        placeholderTextColor={ui.colors.textMuted}
      />
      <TouchableOpacity
        style={[
          styles.button,
          newCategory.length <= 2 && styles.buttonDisabled,
        ]}
        onPress={handleAddCategory}
        disabled={newCategory.length <= 2}
      >
        <Text
          style={[
            styles.buttonText,
            newCategory.length <= 2 && styles.buttonTextDisabled,
          ]}
        >
          Add Category
        </Text>
      </TouchableOpacity>

      <Text style={[styles.subtitle, styles.categoriesTitle]}>
        Current Categories
      </Text>
      <ScrollView style={styles.categoriesList}>
        {categories.map((category) => (
          <View key={category} style={styles.categoryItem}>
            {editingCategory === category ? (
              <>
                <TextInput
                  style={styles.editInput}
                  value={editedCategoryText}
                  onChangeText={setEditedCategoryText}
                  autoFocus
                  placeholderTextColor={ui.colors.textMuted}
                />
                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={() => handleUpdateCategory(category)}
                >
                  <Text style={styles.smallButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.smallButton, styles.cancelButton]}
                  onPress={() => setEditingCategory(null)}
                >
                  <Text style={styles.smallButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.categoryText}>{category}</Text>
                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={() => handleEditCategory(category)}
                >
                  <Text style={styles.smallButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.smallButton, styles.deleteButton]}
                  onPress={() => handleDeleteCategory(category)}
                >
                  <Text style={styles.smallButtonText}>Delete</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingVertical: 18,
    paddingHorizontal: 14,
    backgroundColor: ui.colors.surface,
    borderRadius: ui.radius.lg,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: ui.colors.border,
    ...shadow,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
    color: ui.colors.textPrimary,
  },
  instructions: {
    ...ui.typography.body,
    color: ui.colors.textSecondary,
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: ui.colors.border,
    borderRadius: ui.radius.md,
    padding: 12,
    marginBottom: 15,
    backgroundColor: ui.colors.surface,
    color: ui.colors.textPrimary,
  },
  button: {
    backgroundColor: ui.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: ui.radius.md,
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: ui.colors.disabled,
  },
  buttonText: {
    color: ui.colors.surface,
    textAlign: 'center',
    ...ui.typography.button,
  },
  buttonTextDisabled: {
    opacity: 0.7,
  },
  categoriesTitle: {
    marginTop: 30,
  },
  categoriesList: {
    maxHeight: 300,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: ui.colors.border,
  },
  categoryText: {
    flex: 1,
    fontSize: 16,
    color: ui.colors.textPrimary,
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: ui.colors.border,
    borderRadius: ui.radius.sm,
    padding: 8,
    marginRight: 10,
    color: ui.colors.textPrimary,
  },
  smallButton: {
    backgroundColor: ui.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: ui.radius.sm,
    marginLeft: 10,
  },
  deleteButton: {
    backgroundColor: ui.colors.danger,
  },
  cancelButton: {
    backgroundColor: ui.colors.textMuted,
  },
  smallButtonText: {
    color: ui.colors.surface,
    fontSize: 13,
    fontWeight: '700',
  },
});
