/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import React, { useState, useMemo, useEffect } from 'react';
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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createNote } from '../../service/noteActions';
import { useTheme } from '../../theme/ThemeContext';
import { ui } from '../../theme/ui';
import { Note, Recurrence } from '../../screens/types';
import CategoryPickerField from '../noteForm/CategoryPickerField';
import DateRangePicker from '../dateRangePicker/DateRangePicker';
import SegmentedControl from '../ui/SegmentedControl';
import { formatDayLabel } from '../../utils/noteDates';

type RepeatOption = 'none' | Recurrence;

const REPEAT_OPTIONS: { key: RepeatOption; label: string }[] = [
  { key: 'none', label: 'None' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'biweekly', label: '2 weeks' },
];

interface QuickAddModalProps {
  visible: boolean;
  /** YYYY-MM-DD string of the currently selected calendar day */
  selectedDay: string;
  categories: string[];
  userId?: string;
  onClose: () => void;
  /** Called after the note is saved so the parent can refresh */
  onSaved: () => void;
  /** Called after saving when the user taps "More…" — passes the new note id for navigation */
  onMoreDetails: (noteId: string) => void;
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
  const [startDate, setStartDate] = useState(selectedDay);
  const [endDate, setEndDate] = useState(selectedDay);
  const [showDateRange, setShowDateRange] = useState(false);
  const [repeat, setRepeat] = useState<RepeatOption>('none');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setStartDate(selectedDay);
      setEndDate(selectedDay);
      setShowDateRange(false);
      setRepeat('none');
    }
  }, [visible, selectedDay]);

  const pickerItems = useMemo(
    () => categories,
    [categories],
  );

  const canSave = title.trim().length >= 1 && category !== 'Select an option';

  const reset = () => {
    setTitle('');
    setCategory('Select an option');
    setStartDate(selectedDay);
    setEndDate(selectedDay);
    setShowDateRange(false);
    setRepeat('none');
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
    startDate,
    endDate: repeat === 'none' ? endDate : startDate,
    recurrence: repeat === 'none' ? undefined : repeat,
  });

  const handleRepeatChange = (value: RepeatOption) => {
    setRepeat(value);
    if (value !== 'none') {
      setEndDate(startDate);
      setShowDateRange(false);
    }
  };

  const handleSave = async () => {
    if (!userId || !canSave) return;
    setIsSaving(true);
    try {
      const payload = buildNotePayload();
      const newId = await createNote(payload);
      if (!newId) return;
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
      const newId = await createNote(payload);
      if (!newId) return;
      reset();
      onMoreDetails(newId);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDayLabelLocal = (day: string) => formatDayLabel(day);

  const dayLabel = useMemo(() => formatDayLabelLocal(startDate), [startDate]);

  const isMultiDay = repeat === 'none' && endDate !== startDate;
  const dateActionLabel = isMultiDay ? 'Edit dates' : 'Add end date';

  const handleDateRangeConfirm = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setShowDateRange(false);
  };

  const handleDateRangeClear = () => {
    setStartDate(selectedDay);
    setEndDate(selectedDay);
    setShowDateRange(false);
  };

  const handleUseSingleDay = () => {
    setStartDate(selectedDay);
    setEndDate(selectedDay);
    setShowDateRange(false);
  };

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
          marginBottom: 6,
        },
        dateRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        },
        addEndDateBtn: {
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: ui.radius.pill,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surfaceSoft,
        },
        addEndDateText: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.primaryDark,
        },
        singleDayBtn: {
          alignSelf: 'flex-start',
          marginBottom: 12,
          paddingVertical: 4,
        },
        singleDayText: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.textSecondary,
        },
        repeatLabel: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.textSecondary,
          marginBottom: 6,
        },
        repeatControl: {
          marginBottom: 12,
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
              {showDateRange && repeat === 'none' ? (
                <>
                  <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onConfirm={handleDateRangeConfirm}
                    onClear={handleDateRangeClear}
                  />
                  <TouchableOpacity
                    style={styles.singleDayBtn}
                    onPress={handleUseSingleDay}
                    accessibilityLabel="Use single day only"
                  >
                    <Text style={styles.singleDayText}>Use single day only</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.dateRow}>
                  <Text style={styles.dateLabelText}>
                    <MaterialCommunityIcons
                      name="calendar-check"
                      size={12}
                      color={colors.textMuted}
                    />{' '}
                    {repeat !== 'none'
                      ? dayLabel
                      : endDate !== startDate
                        ? `${formatDayLabelLocal(startDate)} → ${formatDayLabelLocal(endDate)}`
                        : dayLabel}
                  </Text>
                  {repeat === 'none' ? (
                    <TouchableOpacity
                      style={styles.addEndDateBtn}
                      onPress={() => setShowDateRange(true)}
                      accessibilityLabel={dateActionLabel}
                    >
                      <Text style={styles.addEndDateText}>{dateActionLabel}</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              )}

              <Text style={styles.repeatLabel}>Repeat</Text>
              <SegmentedControl
                options={REPEAT_OPTIONS}
                value={repeat}
                onChange={handleRepeatChange}
                style={styles.repeatControl}
              />

              {/* Category picker */}
              <CategoryPickerField
                categories={pickerItems}
                value={category}
                onValueChange={setCategory}
              />

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
