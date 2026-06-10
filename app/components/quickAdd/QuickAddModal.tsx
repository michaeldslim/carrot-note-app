/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { addNote } from '../../service/firebaseService';
import { upsertDeadlineReminder } from '../../service/notificationService';
import { useTheme } from '../../theme/ThemeContext';
import { ui } from '../../theme/ui';
import { Note } from '../../screens/types';
import CustomDropdown from '../../screens/CustomDropdown';

interface QuickAddModalProps {
  visible: boolean;
  /** YYYY-MM-DD string of the currently selected calendar day */
  selectedDay: string;
  categories: string[];
  userId?: string;
  onClose: () => void;
  /** Called after the note is saved so the parent can refresh */
  onSaved: () => void;
  /** Called after saving when the user taps "More…" — passes the saved note for navigation */
  onMoreDetails: (note: Note) => void;
}

const QuickAddModal: React.FC<QuickAddModalProps> = ({
  visible,
  selectedDay,
  categories,
  userId,
  onClose,
  onSaved,
  onMoreDetails,
}) => {
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Select an option');
  const [isSaving, setIsSaving] = useState(false);

  const pickerItems = useMemo(
    () => ['Select an option', ...categories],
    [categories],
  );

  const canSave = title.trim().length >= 1 && category !== 'Select an option';

  const reset = () => {
    setTitle('');
    setCategory('Select an option');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  /** Builds the base note payload from current form state */
  const buildNotePayload = (): Omit<Note, 'id'> => ({
    title: title.trim(),
    note: '',
    completed: false,
    createdAt: new Date().toISOString(),
    category,
    userId,
    startDate: selectedDay,
    endDate: selectedDay,
  });

  const handleSave = async () => {
    if (!userId || !canSave) return;
    setIsSaving(true);
    try {
      const payload = buildNotePayload();
      const newId = await addNote(payload);
      await upsertDeadlineReminder({
        id: newId,
        title: payload.title,
        note: payload.note,
        endDate: payload.endDate,
      });
      reset();
      onSaved();
    } finally {
      setIsSaving(false);
    }
  };

  /** Save first, then open NoteDetail for full editing */
  const handleMoreDetails = async () => {
    if (!userId || !canSave) return;
    setIsSaving(true);
    try {
      const payload = buildNotePayload();
      const newId = await addNote(payload);
      await upsertDeadlineReminder({
        id: newId,
        title: payload.title,
        note: payload.note,
        endDate: payload.endDate,
      });
      reset();
      onMoreDetails({ ...payload, id: newId });
    } finally {
      setIsSaving(false);
    }
  };

  const dayLabel = useMemo(() => {
    const d = new Date(selectedDay + 'T00:00:00');
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }, [selectedDay]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          backgroundColor: colors.overlay,
          justifyContent: 'flex-end',
        },
        sheet: {
          backgroundColor: colors.background,
          borderTopLeftRadius: ui.radius.lg,
          borderTopRightRadius: ui.radius.lg,
          paddingBottom: Platform.OS === 'ios' ? 32 : 16,
        },
        handle: {
          width: 40,
          height: 4,
          backgroundColor: colors.border,
          borderRadius: 2,
          alignSelf: 'center',
          marginTop: 12,
          marginBottom: 8,
        },
        header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 10,
        },
        headerTitle: {
          fontSize: 17,
          fontWeight: '700',
          color: colors.textPrimary,
        },
        closeBtn: {
          paddingHorizontal: 12,
          paddingVertical: 6,
          backgroundColor: colors.surfaceSoft,
          borderRadius: ui.radius.pill,
          borderWidth: 1,
          borderColor: colors.border,
        },
        closeBtnText: {
          fontSize: 13,
          fontWeight: '600',
          color: colors.primaryDark,
        },
        body: {
          paddingHorizontal: 16,
          paddingTop: 4,
        },
        dateLabelText: {
          fontSize: 12,
          color: colors.textMuted,
          marginBottom: 10,
        },
        input: {
          fontSize: 16,
          padding: 12,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: ui.radius.md,
          backgroundColor: colors.surface,
          color: colors.textPrimary,
          marginBottom: 12,
        },
        inputActive: {
          borderColor: colors.primary,
        },
        pickerContainer: {
          marginBottom: 12,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderRadius: ui.radius.md,
        },
        actions: {
          flexDirection: 'row',
          gap: 10,
          marginTop: 4,
        },
        saveBtn: {
          flex: 1,
          backgroundColor: colors.primary,
          borderRadius: ui.radius.md,
          paddingVertical: 13,
          alignItems: 'center',
        },
        saveBtnDisabled: {
          backgroundColor: colors.disabled,
        },
        saveBtnText: {
          color: colors.surface,
          fontSize: 15,
          fontWeight: '700',
        },
        detailsBtn: {
          paddingHorizontal: 16,
          paddingVertical: 13,
          borderRadius: ui.radius.md,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        },
        detailsBtnDisabled: {
          opacity: 0.45,
        },
        detailsBtnText: {
          fontSize: 13,
          color: colors.primaryDark,
          fontWeight: '600',
        },
        loadingRow: {
          flex: 1,
          paddingVertical: 13,
          alignItems: 'center',
        },
      }),
    [colors],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <SafeAreaView>
          <View style={styles.sheet}>
            {/* Drag handle */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>New event</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={handleClose}
                accessibilityLabel="Cancel"
              >
                <Text style={styles.closeBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.body}>
              {/* Date label */}
              <Text style={styles.dateLabelText}>
                <MaterialCommunityIcons
                  name="calendar-check"
                  size={12}
                  color={colors.textMuted}
                />{' '}
                {dayLabel}
              </Text>

              {/* Category picker */}
              {Platform.OS === 'ios' ? (
                <CustomDropdown
                  selectedValue={category}
                  items={pickerItems}
                  onValueChange={(value) => setCategory(value)}
                />
              ) : (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={category}
                    onValueChange={(value) => setCategory(value)}
                    style={{ color: colors.textPrimary, fontSize: 16 }}
                  >
                    {pickerItems.map((item) => (
                      <Picker.Item key={item} label={item} value={item} />
                    ))}
                  </Picker>
                </View>
              )}

              {/* Title input */}
              <TextInput
                style={[styles.input, title.length > 0 && styles.inputActive]}
                placeholder="Event title…"
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={(t) => setTitle(t.trimStart())}
                maxLength={80}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSave}
                accessibilityLabel="Event title"
              />

              {/* Action buttons */}
              <View style={styles.actions}>
                {isSaving ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator color={colors.primary} />
                  </View>
                ) : (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.saveBtn,
                        !canSave && styles.saveBtnDisabled,
                      ]}
                      onPress={handleSave}
                      disabled={!canSave}
                      accessibilityLabel="Save event"
                    >
                      <Text style={styles.saveBtnText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.detailsBtn,
                        !canSave && styles.detailsBtnDisabled,
                      ]}
                      onPress={handleMoreDetails}
                      disabled={!canSave}
                      accessibilityLabel="Add more details"
                    >
                      <Text style={styles.detailsBtnText}>More…</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default QuickAddModal;
