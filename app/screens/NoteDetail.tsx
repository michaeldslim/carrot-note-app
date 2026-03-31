/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import {
  View,
  StyleSheet,
  TextInput,
  TextStyle,
  Modal,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, { useState, useMemo } from 'react';
import {
  deleteNote,
  updateNote,
  toggleStatus,
} from '../service/firebaseService';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackList } from '../navigation/RootNavigator';
import { NoteUpdateButton } from '../components/noteUpdateButton';
import { NoteActionButton } from '../components/noteActionButton';
import { getShadow, ui } from '../theme/ui';
import { useTheme } from '../theme/ThemeContext';

type NoteDetailProps = NativeStackScreenProps<RootStackList, 'Detail'>;

const NoteDetail = ({ route, navigation }: NoteDetailProps) => {
  const { noteItem } = route.params;
  const { colors } = useTheme();

  const [editTitle, setEditTitle] = useState<string>(noteItem.title ?? '');
  const [editNote, setEditNote] = useState<string>(noteItem.note);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const styles = useMemo(() => StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
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
    titleInput: {
      fontSize: 16,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: ui.radius.md,
      width: '100%',
      marginBottom: ui.spacing.md,
      backgroundColor: colors.surface,
      color: colors.textPrimary,
    },
    input: {
      fontSize: 16,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: ui.radius.md,
      width: '100%',
      minHeight: 120,
      marginBottom: ui.spacing.md,
      backgroundColor: colors.surface,
      color: colors.textPrimary,
    },
    item: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: colors.background,
      padding: 15,
      borderRadius: 5,
      marginBottom: 10,
      width: '100%',
    },
    buttonContainer: {
      marginTop: 4,
      width: '100%',
    },
    button: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 15,
      marginBottom: 10,
      borderRadius: ui.radius.md,
      width: '100%',
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
      padding: 10,
      alignItems: 'center',
      backgroundColor: colors.disabled,
      borderRadius: ui.radius.md,
      marginRight: 5,
    },
    modalButtonDelete: {
      flex: 1,
      padding: 10,
      alignItems: 'center',
      backgroundColor: colors.danger,
      borderRadius: ui.radius.md,
      marginLeft: 5,
    },
    modalButtonText: {
      color: colors.surface,
      fontSize: 15,
      fontWeight: '700',
    },
  }), [colors]);

  const handleUpdateNote = async () => {
    await updateNote(noteItem.id, {
      title: editTitle.trim() || undefined,
      note: editNote,
    });
    navigation.goBack();
  };

  const handleDeleteNote = async () => {
    if (!noteItem.id) return;

    await deleteNote(noteItem.id);
    setIsModalVisible(false);
    navigation.goBack();
  };

  const confirmDelete = () => {
    setIsModalVisible(true);
  };

  const cancelDelete = () => {
    setIsModalVisible(false);
  };

  const handleToggleStatus = async () => {
    await toggleStatus(noteItem.id, !noteItem.completed);
    navigation.goBack();
  };

  const getStatusText = (completed: boolean) => {
    return completed ? 'Mark as Incomplete' : 'Mark as Complete';
  };

  const normalizedOriginalTitle = (noteItem.title ?? '').trim();
  const normalizedCurrentTitle = editTitle.trim();
  const isDisabled =
    editNote === noteItem.note && normalizedCurrentTitle === normalizedOriginalTitle;

  const commonButtonStyles = [styles.button, styles.buttonText];

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
      <View style={styles.formHeader}>
        <Text style={styles.title}>Edit note</Text>
        <Text style={styles.subtitle}>Update details or manage completion status</Text>
      </View>
      <View style={styles.form}>
        <TextInput
          style={styles.titleInput}
          value={editTitle}
          onChangeText={(text) => setEditTitle(text.trimStart())}
          placeholder="Todo"
          maxLength={80}
          multiline={false}
        />
        <TextInput
          style={styles.input}
          value={editNote}
          onChangeText={(text) => setEditNote(text.trimStart())}
          placeholder="Edit note (optional)"
          placeholderTextColor={colors.textMuted}
          maxLength={200}
          multiline={true}
          numberOfLines={3}
          textAlignVertical="top"
        />
        <View style={styles.buttonContainer}>
          <NoteUpdateButton
            disabled={isDisabled}
            styles={styles}
            onPress={!isDisabled ? handleUpdateNote : undefined}
            text="Update note"
          />
          <NoteActionButton
            styles={[...commonButtonStyles, styles.deleteButton]}
            onPress={confirmDelete}
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
      </View>
      </View>
      <Modal
        visible={isModalVisible}
        transparent={true}
        statusBarTranslucent={true}
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
                onPress={cancelDelete}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonDelete}
                onPress={handleDeleteNote}
              >
                <Text style={styles.modalButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default NoteDetail;
