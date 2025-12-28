/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  TextStyle,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState, useCallback } from 'react';
import {
  fetchTodos,
  addTodo,
  deleteTodo,
  fetchCategories,
  addCategories,
} from '../service/firebaseService';
import { Todo } from './types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackList } from '../navigation/RootNavigator';
import { useIsFocused } from '@react-navigation/native';
import NoteItem from './NoteItem';
import CustomDropdown from './CustomDropdown';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type NoteListProps = NativeStackScreenProps<RootStackList, 'List'>;

const NoteList = ({ navigation }: NoteListProps) => {
  const isFocused = useIsFocused();
  const [todo, setTodo] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [category, setCategory] = useState<string>('Select an option');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [categories, setCategories] = useState<string[]>(['Select an option']);
  const auth = FIREBASE_AUTH;
  const userId = auth.currentUser?.uid;

  const filterTodos = useCallback(() => {
    if (selectedCategory === 'All') {
      setFilteredTodos(todos);
    } else {
      setFilteredTodos(
        todos.filter((todo) => todo.category === selectedCategory),
      );
    }
  }, [todos, selectedCategory]);

  useEffect(() => {
    const loadTodos = async () => {
      if (userId) {
        const todos = await fetchTodos(userId);
        setTodos(todos);
      }
    };
    loadTodos().then();
  }, [userId, isFocused]);

  useEffect(() => {
    const loadCategories = async () => {
      if (userId) {
        try {
          const fetchedCategories = await fetchCategories(userId);
          if (!fetchedCategories || fetchedCategories.length === 0) {
            const initialCategories = ['Home', 'Shopping'];
            await addCategories(userId, initialCategories);
            setCategories(['Select an option', ...initialCategories]);
          } else {
            setCategories(['Select an option', ...fetchedCategories]);
          }
        } catch (error) {
          if (error instanceof Error) {
            Alert.alert('Error', `Failed to load categories: ${error.message}`);
          } else {
            Alert.alert('Error', 'An unknown error occurred');
          }
        }
      }
    };
    loadCategories().then();
  }, [userId, isFocused]);

  useEffect(() => {
    filterTodos();
  }, [todos, selectedCategory, filterTodos]);

  const getTotalTodosByCategory = (category: string) => {
    if (category === 'All') {
      return todos.length;
    }
    return todos.filter((todo) => todo.category === category).length;
  };

  const handleAddTodo = async () => {
    if (userId && title.trim() && category) {
      const todoItem: Omit<Todo, 'id'> = {
        title: title.trim() || undefined,
        todo,
        completed: false,
        createdAt: new Date().toISOString(),
        category,
        userId: userId,
      };
      await addTodo(todoItem);
      const todos = await fetchTodos(userId);
      setTodos(todos);
      setTodo('');
      setTitle('');
      setCategory('Select an option');
    }
  };

  const confirmDelete = async (todoId: string) => {
    if (!todoId) return;
    if (userId) {
      await deleteTodo(todoId);
      const todos = await fetchTodos(userId);
      setTodos(todos);
    }
  };

  const onRefresh = useCallback(async () => {
    if (!userId) return;
    setRefreshing(true);
    try {
      const todos = await fetchTodos(userId);
      setTodos(todos);
    } catch (error) {
      console.error('Error refreshing notes:', error);
    } finally {
      setRefreshing(false);
    }
  }, [userId]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <SafeAreaView style={styles.safeArea}>
        <GestureHandlerRootView style={styles.container}>
          <View style={styles.inputSection}>
            {Platform.OS === 'ios' ? (
              <CustomDropdown
                selectedValue={category}
                items={categories}
                onValueChange={(value) => setCategory(value)}
              />
            ) : (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={category}
                  onValueChange={(value) => setCategory(value)}
                  style={{
                    color: '#FFFFFF',
                    fontSize: 16,
                  }}
                >
                  {categories.map((item) => (
                    <Picker.Item key={item} label={item} value={item} />
                  ))}
                </Picker>
              </View>
            )}
            <TextInput
              style={
                category !== 'Select an option'
                  ? styles.titleInputActive
                  : styles.titleInputInactive
              }
              placeholder={'Title'}
              onChangeText={(text: string) => setTitle(text.trimStart())}
              value={title}
              maxLength={80}
              multiline={false}
              editable={category !== 'Select an option'}
            />
            <TextInput
              style={
                category !== 'Select an option'
                  ? styles.activeInput
                  : styles.inActiveInput
              }
              placeholder={'Jot it down here (optional)'}
              onChangeText={(text: string) => setTodo(text.trimStart())}
              value={todo}
              maxLength={200}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
              editable={category !== 'Select an option'}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  title.trim().length < 3
                    ? styles.disabledButton
                    : styles.addButton,
                ]}
                disabled={title.trim().length < 3}
                onPress={title.trim().length >= 3 ? handleAddTodo : () => {}}
              >
                <Text style={styles.addButtonText}>Add carrot note</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.filterContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryContainer}
              >
                {['All', ...categories.slice(1)].map((category, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.filterButton,
                      selectedCategory === category &&
                        styles.filterButtonSelected,
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        selectedCategory === category &&
                          styles.filterButtonTextSelected,
                      ]}
                    >
                      {category} ({getTotalTodosByCategory(category)})
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
          <View style={styles.listContainer}>
            <FlatList
              data={filteredTodos}
              keyExtractor={(item) => item.id}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              renderItem={({ item }) => (
                <NoteItem
                  todo={item}
                  onPress={() =>
                    navigation.navigate('Detail', { todoItem: item })
                  }
                  confirmDelete={confirmDelete}
                />
              )}
              contentContainerStyle={styles.listContentContainer}
              showsVerticalScrollIndicator={true}
              ListFooterComponent={<View style={styles.listFooter} />}
              ListHeaderComponent={<View style={styles.listHeader} />}
              style={styles.flatList}
            />
          </View>
        </GestureHandlerRootView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    marginHorizontal: 10,
  },
  inputSection: {
    paddingVertical: 10,
  },
  listContainer: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
  listContentContainer: {
    paddingHorizontal: 5,
    paddingVertical: 5,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  listFooter: {
    height: Platform.OS === 'ios' ? 40 : 20,
  },
  listHeader: {
    height: 1,
  },
  form: {
    marginVertical: 10,
    flexDirection: 'column',
  },
  activeInput: {
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#2196f3',
    backgroundColor: '#ffffff',
    borderRadius: 5,
    width: '100%',
    marginBottom: 10,
    minHeight: 80,
  },
  inActiveInput: {
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 5,
    width: '100%',
    marginBottom: 10,
    minHeight: 80,
  },
  titleInputActive: {
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#2196f3',
    backgroundColor: '#ffffff',
    borderRadius: 5,
    width: '100%',
    marginBottom: 10,
  },
  titleInputInactive: {
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 5,
    width: '100%',
    marginBottom: 10,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    width: '100%',
  },
  buttonText: {
    color: '#4a4a4a',
    fontSize: 16,
    fontWeight: 'bold',
  } as TextStyle,
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  } as TextStyle,
  disabledButton: {
    backgroundColor: '#d8d8d8',
  },
  addButton: {
    backgroundColor: '#2196f3',
  },
  pickerContainer: {
    marginBottom: 10,
    borderColor: '#2196f3',
    backgroundColor: '#2196f3',
    borderWidth: 1,
    borderRadius: 5,
  },
  inputActiveWrapper: {
    borderColor: '#2196f3',
  },
  inputInActiveWrapper: {
    borderColor: '#cccccc',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 6,
  },
  filterButton: {
    borderRadius: 15,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4a4a4a',
    paddingVertical: 5,
    paddingHorizontal: 5,
    marginRight: 3,
  },
  filterButtonSelected: {
    backgroundColor: '#f0f0f0',
    borderColor: '#4a4a4a',
  },
  filterButtonTextSelected: {
    color: '#4a4a4a',
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
  categoryContainer: {
    flexDirection: 'row',
  },
});

export default NoteList;
