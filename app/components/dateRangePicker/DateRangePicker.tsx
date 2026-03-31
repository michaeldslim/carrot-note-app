/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import React, { useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { ui } from '../../theme/ui';
import { useTheme } from '../../theme/ThemeContext';

interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onConfirm: (start: string, end: string) => void;
  onClear: () => void;
  disabled?: boolean;
}

const toDateString = (iso: string) => iso.slice(0, 10);

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onConfirm,
  onClear,
  disabled = false,
}) => {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [tempStart, setTempStart] = useState<string | null>(startDate ?? null);
  const [tempEnd, setTempEnd] = useState<string | null>(endDate ?? null);

  const handleDayPress = (day: { dateString: string }) => {
    const d = day.dateString;
    if (!tempStart) {
      setTempStart(d);
      setTempEnd(null);
    } else if (!tempEnd) {
      if (d < tempStart) {
        setTempEnd(tempStart);
        setTempStart(d);
      } else {
        setTempEnd(d);
      }
    } else {
      // Both set — tapping on/before start resets; tapping after start updates end only
      if (d <= tempStart) {
        setTempStart(d);
        setTempEnd(null);
      } else {
        setTempEnd(d);
      }
    }
  };

  const markedDates = useMemo(() => {
    const map: Record<string, any> = {};
    if (!tempStart) return map;
    if (!tempEnd) {
      map[tempStart] = { selected: true, selectedColor: colors.primary, startingDay: true, endingDay: true };
      return map;
    }
    let cursor = new Date(tempStart);
    const end = new Date(tempEnd);
    while (cursor <= end) {
      const key = toDateString(cursor.toISOString());
      const isStart = key === tempStart;
      const isEnd = key === tempEnd;
      map[key] = {
        selected: true,
        startingDay: isStart,
        endingDay: isEnd,
        color: isStart || isEnd ? colors.primary : colors.surfaceSoft,
        textColor: isStart || isEnd ? '#F4A0AA' : colors.textPrimary,
      };
      cursor.setDate(cursor.getDate() + 1);
    }
    return map;
  }, [tempStart, tempEnd, colors]);

  const handleOpen = () => {
    if (disabled) return;
    setTempStart(startDate ?? null);
    setTempEnd(endDate ?? null);
    setModalVisible(true);
  };

  const handleConfirm = () => {
    if (tempStart) {
      onConfirm(tempStart, tempEnd ?? tempStart);
    } else if (startDate) {
      onClear();
    }
    setModalVisible(false);
  };

  const handleClear = () => {
    setTempStart(null);
    setTempEnd(null);
  };

  const styles = useMemo(() => StyleSheet.create({
    triggerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: disabled ? colors.border : startDate ? colors.primary : colors.border,
      borderRadius: ui.radius.md,
      backgroundColor: disabled ? colors.surfaceSoft : startDate ? colors.surfaceSoft : colors.surface,
      marginBottom: ui.spacing.md,
      opacity: disabled ? 0.45 : 1,
    },
    triggerText: {
      fontSize: 14,
      color: disabled ? colors.textMuted : startDate ? colors.primaryDark : colors.textMuted,
      fontWeight: startDate && !disabled ? '600' : '400',
    },
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
    },
    safeArea: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: ui.radius.lg,
      borderTopRightRadius: ui.radius.lg,
      paddingBottom: 32,
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: 12,
      marginBottom: 4,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    closeButton: {
      padding: 4,
    },
    closeText: {
      fontSize: 18,
      color: colors.textMuted,
      lineHeight: 22,
    },
    hint: {
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    hintText: {
      fontSize: 12,
      color: colors.textMuted,
    },
    footer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingTop: 14,
      gap: 10,
    },
    clearButton: {
      flex: 1,
      paddingVertical: 11,
      borderRadius: ui.radius.md,
      alignItems: 'center',
      backgroundColor: colors.surfaceSoft,
      borderWidth: 1,
      borderColor: colors.border,
    },
    clearText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    confirmButton: {
      flex: 2,
      paddingVertical: 11,
      borderRadius: ui.radius.md,
      alignItems: 'center',
      backgroundColor: colors.primary,
    },
    confirmText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.surface,
    },
  }), [colors, startDate, disabled]);

  const label = startDate
    ? endDate && endDate !== startDate
      ? `${startDate} → ${endDate}`
      : `${startDate}`
    : '📅  Set date range (optional)';

  return (
    <>
      <TouchableOpacity style={styles.triggerButton} onPress={handleOpen}>
        <Text style={styles.triggerText}>{label}</Text>
      </TouchableOpacity>
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <SafeAreaView style={styles.safeArea}>
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <View style={styles.sheet}>
                <View style={styles.handle} />
                <View style={styles.header}>
                  <Text style={styles.headerTitle}>Select Date Range</Text>
                  <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                    <Text style={styles.closeText}>✕</Text>
                  </TouchableOpacity>
                </View>
              <View style={styles.hint}>
                <Text style={styles.hintText}>
                  {!tempStart ? 'Tap to set start date' : !tempEnd ? 'Tap to set end date' : `${tempStart} → ${tempEnd}`}
                </Text>
              </View>
              <Calendar
                markingType="period"
                markedDates={markedDates}
                onDayPress={handleDayPress}
                theme={{
                  backgroundColor: colors.background,
                  calendarBackground: colors.background,
                  textSectionTitleColor: colors.textSecondary,
                  selectedDayBackgroundColor: colors.primary,
                  selectedDayTextColor: '#F4A0AA',
                  todayTextColor: colors.primaryDark,
                  dayTextColor: colors.textPrimary,
                  textDisabledColor: colors.textMuted,
                  arrowColor: colors.primary,
                  monthTextColor: colors.textPrimary,
                }}
              />
              <View style={styles.footer}>
                <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleConfirm}
                >
                  <Text style={styles.confirmText}>{tempStart ? 'Confirm' : startDate ? 'Remove dates' : 'Cancel'}</Text>
                </TouchableOpacity>
              </View>
              </View>
            </TouchableOpacity>
          </SafeAreaView>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default DateRangePicker;
