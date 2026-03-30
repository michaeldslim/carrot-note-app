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
import React, { useState } from 'react';
import {
  deleteNote,
  updateNote,
  toggleStatus,
} from '../service/firebaseService';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackList } from '../navigation/RootNavigator';
import { NoteUpdateButton } from '../components/noteUpdateButton';
import { NoteActionButton } from '../components/noteActionButton';
import { shadow, ui } from '../theme/ui';

type NoteDetailProps = NativeStackScreenProps<RootStackList, 'Detail'>;

const NoteDetail = ({ route, navigation }: NoteDetailProps) => {
  const { noteItem } = route.params;

  const [editTitle, setEditTitle] = useState<string>(noteItem.title ?? '');
  const [editNote, setEditNote] = useState<string>(noteItem.note);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

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
          placeholder="Title"
          maxLength={80}
          multiline={false}
        />
        <TextInput
          style={styles.input}
          value={editNote}
          onChangeText={(text) => setEditNote(text.trimStart())}
          placeholder="Edit note (optional)"
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

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    marginHorizontal: 16,
    backgroundColor: ui.colors.surface,
    borderRadius: ui.radius.lg,
    borderWidth: 1,
    borderColor: ui.colors.border,
    padding: ui.spacing.lg,
    ...shadow,
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
    color: ui.colors.textPrimary,
  },
  subtitle: {
    ...ui.typography.subtitle,
    color: ui.colors.textSecondary,
  },
  titleInput: {
    fontSize: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: ui.colors.border,
    borderRadius: ui.radius.md,
    width: '100%',
    marginBottom: ui.spacing.md,
    backgroundColor: ui.colors.surface,
    color: ui.colors.textPrimary,
  },
  input: {
    fontSize: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: ui.colors.border,
    borderRadius: ui.radius.md,
    width: '100%',
    minHeight: 120,
    marginBottom: ui.spacing.md,
    backgroundColor: ui.colors.surface,
    color: ui.colors.textPrimary,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
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
    padding: 15,
    marginBottom: 10,
    borderRadius: ui.radius.md,
    width: '100%',
  },
  buttonText: {
    color: ui.colors.surface,
    ...ui.typography.button,
  } as TextStyle,
  updateButton: {
    backgroundColor: ui.colors.primary,
  },
  disabledButton: {
    backgroundColor: ui.colors.disabled,
  },
  deleteButton: {
    backgroundColor: ui.colors.danger,
  },
  toggleButton: {
    backgroundColor: ui.colors.success,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ui.colors.overlay,
  },
  modalContent: {
    width: '88%',
    padding: 20,
    backgroundColor: ui.colors.surface,
    borderRadius: ui.radius.lg,
    borderWidth: 1,
    borderColor: ui.colors.border,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 17,
    marginBottom: 20,
    textAlign: 'center',
    color: ui.colors.textPrimary,
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
    backgroundColor: ui.colors.disabled,
    borderRadius: ui.radius.md,
    marginRight: 5,
  },
  modalButtonDelete: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    backgroundColor: ui.colors.danger,
    borderRadius: ui.radius.md,
    marginLeft: 5,
  },
  modalButtonText: {
    color: ui.colors.surface,
    fontSize: 15,
    fontWeight: '700',
  },
});

export default NoteDetail;
