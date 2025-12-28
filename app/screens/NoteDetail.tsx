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
    <View style={styles.container}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 10,
  },
  form: {
    marginVertical: 10,
    flexDirection: 'column',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  titleInput: {
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 5,
    width: '100%',
    marginBottom: 10,
  },
  input: {
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 5,
    width: '100%',
    marginBottom: 10,
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
    marginTop: 10,
    width: '100%',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    width: '100%',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  } as TextStyle,
  updateButton: {
    backgroundColor: '#2196f3',
  },
  disabledButton: {
    backgroundColor: '#d8d8d8',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  toggleButton: {
    backgroundColor: '#4caf50',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
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
    backgroundColor: '#d8d8d8',
    borderRadius: 5,
    marginRight: 5,
  },
  modalButtonDelete: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#f44336',
    borderRadius: 5,
    marginLeft: 5,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default NoteDetail;
