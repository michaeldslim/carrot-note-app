/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import {
  View,
  StyleSheet,
  TextStyle,
  Modal,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  deleteNoteWithReminder,
  updateNoteWithReminder,
} from '../service/noteActions';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackList } from '../navigation/RootNavigator';
import { NoteUpdateButton } from '../components/noteUpdateButton';
import { NoteActionButton } from '../components/noteActionButton';
import { getShadow, ui } from '../theme/ui';
import { useTheme } from '../theme/ThemeContext';
import DateRangePicker from '../components/dateRangePicker/DateRangePicker';
import CategoryPickerField from '../components/noteForm/CategoryPickerField';
import CharCountField from '../components/noteForm/CharCountField';
import { useNotesContext } from '../context/NotesContext';
import { useCategories } from '../hooks/useCategories';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { MIN_TOUCH_TARGET } from '../utils/accessibility';
import { safeGoBack } from '../navigation/navigationHelpers';

type NoteDetailProps = NativeStackScreenProps<RootStackList, 'Detail'>;

const CATEGORY_PLACEHOLDER = 'Select an option';

const NoteDetail = ({ route, navigation }: NoteDetailProps) => {
  const { noteId, isJustCreated = false } = route.params;
  const { colors } = useTheme();
  const userId = FIREBASE_AUTH.currentUser?.uid;
  const { quickAddCategories } = useCategories(userId);
  const {
    getNoteById,
    loading,
    toggleNoteOptimistic,
  } = useNotesContext();
  const noteItem = getNoteById(noteId);

  const [editTitle, setEditTitle] = useState<string>('');
  const [editNote, setEditNote] = useState<string>('');
  const [editCategory, setEditCategory] = useState<string>(CATEGORY_PLACEHOLDER);
  const [editStartDate, setEditStartDate] = useState<string | undefined>();
  const [editEndDate, setEditEndDate] = useState<string | undefined>();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  useEffect(() => {
    if (!noteItem) return;
    setEditTitle(noteItem.title ?? '');
    setEditNote(noteItem.note);
    setEditCategory(noteItem.category ?? CATEGORY_PLACEHOLDER);
    setEditStartDate(noteItem.startDate);
    setEditEndDate(noteItem.endDate);
  }, [noteItem]);

  useEffect(() => {
    if (!loading && !noteItem && !isJustCreated) {
      safeGoBack(navigation);
    }
  }, [loading, noteItem, isJustCreated, navigation]);

  const normalizedOriginalTitle = (noteItem?.title ?? '').trim();
  const normalizedCurrentTitle = editTitle.trim();
  const normalizedOriginalNote = (noteItem?.note ?? '').trim();
  const normalizedCurrentNote = editNote.trim();
  const originalCategory = noteItem?.category ?? CATEGORY_PLACEHOLDER;

  const isUnchanged =
    normalizedCurrentNote === normalizedOriginalNote &&
    normalizedCurrentTitle === normalizedOriginalTitle &&
    editStartDate === noteItem?.startDate &&
    editEndDate === noteItem?.endDate &&
    editCategory === originalCategory;

  const hasUnsavedChanges = !isJustCreated && !isUnchanged;
  const isDisabled = !isJustCreated && isUnchanged;
  const updateButtonText = isJustCreated ? 'Save details' : 'Update note';

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!hasUnsavedChanges) return;

      e.preventDefault();
      Alert.alert(
        'Discard changes?',
        'You have unsaved changes. Leave without saving?',
        [
          { text: 'Keep editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ],
      );
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges]);

  const styles = useMemo(() => StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    scrollContent: {
      flexGrow: 1,
      paddingTop: 16,
      paddingBottom: 16,
    },
    container: {
      marginHorizontal: 16,
      backgroundColor: colors.surface,
      borderRadius: ui.radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: ui.spacing.lg,
      ...getShadow(colors.shadowColor),
    },
    formHeader: {
      marginBottom: ui.spacing.md,
    },
    form: {
      marginVertical: 4,
      flexDirection: 'column',
    },
    title: {
      ...ui.typography.title,
      fontSize: 26,
      color: colors.textPrimary,
    },
    subtitle: {
      ...ui.typography.subtitle,
      color: colors.textSecondary,
    },
    bodyInput: {
      height: 160,
      textAlignVertical: 'top' as const,
    },
    stickyBar: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: Platform.OS === 'ios' ? 24 : 14,
      gap: 8,
      ...getShadow(colors.shadowColor),
    },
    button: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 15,
      borderRadius: ui.radius.md,
      width: '100%',
      minHeight: MIN_TOUCH_TARGET,
    },
    buttonText: {
      color: colors.surface,
      ...ui.typography.button,
    } as TextStyle,
    updateButton: {
      backgroundColor: colors.primary,
    },
    disabledButton: {
      backgroundColor: colors.disabled,
    },
    deleteButton: {
      backgroundColor: colors.danger,
    },
    toggleButton: {
      backgroundColor: colors.success,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.overlay,
    },
    modalContent: {
      width: '88%',
      padding: 20,
      backgroundColor: colors.surface,
      borderRadius: ui.radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    modalText: {
      fontSize: 17,
      marginBottom: 20,
      textAlign: 'center',
      color: colors.textPrimary,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
    },
    modalButtonCancel: {
      flex: 1,
      padding: 12,
      alignItems: 'center',
      backgroundColor: colors.disabled,
      borderRadius: ui.radius.md,
      marginRight: 5,
      minHeight: MIN_TOUCH_TARGET,
      justifyContent: 'center',
    },
    modalButtonDelete: {
      flex: 1,
      padding: 12,
      alignItems: 'center',
      backgroundColor: colors.danger,
      borderRadius: ui.radius.md,
      marginLeft: 5,
      minHeight: MIN_TOUCH_TARGET,
      justifyContent: 'center',
    },
    modalButtonText: {
      color: colors.surface,
      fontSize: 15,
      fontWeight: '700',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 48,
    },
  }), [colors]);

  const handleUpdateNote = useCallback(async () => {
    if (!noteItem) return;
    const categoryValue =
      editCategory === CATEGORY_PLACEHOLDER ? undefined : editCategory;
    const success = await updateNoteWithReminder(
      noteItem.id,
      {
        title: normalizedCurrentTitle || undefined,
        note: editNote,
        startDate: editStartDate,
        endDate: editEndDate,
        category: categoryValue,
      },
      {
        id: noteItem.id,
        title: normalizedCurrentTitle || undefined,
        note: editNote,
        endDate: editEndDate,
      },
    );
    if (success) {
      safeGoBack(navigation);
    }
  }, [
    noteItem,
    editCategory,
    normalizedCurrentTitle,
    editNote,
    editStartDate,
    editEndDate,
    navigation,
  ]);

  const handleDeleteNote = async () => {
    if (!noteItem?.id) return;

    const success = await deleteNoteWithReminder(noteItem.id);
    if (success) {
      setIsModalVisible(false);
      safeGoBack(navigation);
    }
  };

  const handleToggleStatus = async () => {
    if (!noteItem) return;
    const success = await toggleNoteOptimistic(
      noteItem.id,
      !noteItem.completed,
    );
    if (success) {
      safeGoBack(navigation);
    }
  };

  if (loading || !noteItem) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const getStatusText = (completed: boolean) =>
    completed ? 'Mark as Incomplete' : 'Mark as Complete';

  const commonButtonStyles = [styles.button, styles.buttonText];

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.formHeader}>
            <Text style={styles.title}>Update note</Text>
            <Text style={styles.subtitle}>
              Update details or manage completion status
            </Text>
          </View>
          <View style={styles.form}>
            <CategoryPickerField
              categories={quickAddCategories}
              value={editCategory}
              onValueChange={setEditCategory}
            />
            <CharCountField
              value={editTitle}
              onChangeText={(text) => setEditTitle(text.trimStart())}
              maxLength={80}
              placeholder="Todo"
              label="Title"
            />
            <CharCountField
              value={editNote}
              onChangeText={(text) => setEditNote(text.trimStart())}
              maxLength={200}
              placeholder="Detail note (optional)"
              label="Details"
              multiline
              numberOfLines={3}
              scrollEnabled
              inputStyle={styles.bodyInput}
            />
            <DateRangePicker
              startDate={editStartDate}
              endDate={editEndDate}
              onConfirm={(s, e) => {
                setEditStartDate(s);
                setEditEndDate(e);
              }}
              onClear={() => {
                setEditStartDate(undefined);
                setEditEndDate(undefined);
              }}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.stickyBar}>
        <NoteUpdateButton
          disabled={isDisabled}
          styles={styles}
          onPress={!isDisabled ? handleUpdateNote : undefined}
          text={updateButtonText}
        />
        <NoteActionButton
          styles={[...commonButtonStyles, styles.deleteButton]}
          onPress={() => setIsModalVisible(true)}
          text="Delete note"
          textStyles={[styles.buttonText]}
        />
        <NoteActionButton
          styles={[...commonButtonStyles, styles.toggleButton]}
          onPress={handleToggleStatus}
          text={getStatusText(noteItem.completed)}
          textStyles={[styles.buttonText]}
        />
      </View>

      <Modal
        visible={isModalVisible}
        transparent
        statusBarTranslucent
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Are you sure you want to delete this item?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setIsModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Cancel delete"
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonDelete}
                onPress={handleDeleteNote}
                accessibilityRole="button"
                accessibilityLabel="Confirm delete"
              >
                <Text style={styles.modalButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default NoteDetail;
