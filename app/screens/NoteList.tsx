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
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  fetchNotes,
  addNote,
  deleteNote,
  fetchCategories,
  addCategories,
} from '../service/firebaseService';
import { Note } from './types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackList } from '../navigation/RootNavigator';
import { useIsFocused } from '@react-navigation/native';
import NoteItem from './NoteItem';
import CustomDropdown from './CustomDropdown';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getShadow, ui } from '../theme/ui';
import { useTheme } from '../theme/ThemeContext';
import CalendarModal from '../components/calendarModal/CalendarModal';
import DateRangePicker from '../components/dateRangePicker/DateRangePicker';

type NoteListProps = NativeStackScreenProps<RootStackList, 'List'>;

const NoteList = ({ navigation }: NoteListProps) => {
  const isFocused = useIsFocused();
  const [noteText, setNoteText] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [category, setCategory] = useState<string>('Select an option');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [categories, setCategories] = useState<string[]>(['Select an option']);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [calendarVisible, setCalendarVisible] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [formExpanded, setFormExpanded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const auth = FIREBASE_AUTH;
  const userId = auth.currentUser?.uid;
  const detailsInputRef = useRef<any>(null);
  const formScrollRef = useRef<ScrollView>(null);

  const filterNotes = useCallback(() => {
    if (selectedCategory === 'All') {
      setFilteredNotes(notes);
    } else {
      setFilteredNotes(
        notes.filter((note) => note.category === selectedCategory),
      );
    }
  }, [notes, selectedCategory]);

  useEffect(() => {
    const loadNotes = async () => {
      setIsLoading(true);
      if (userId) {
        const fetchedNotes = await fetchNotes(userId);
        setNotes(fetchedNotes);
      }
      setIsLoading(false);
    };
    loadNotes().then();
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
    filterNotes();
  }, [notes, selectedCategory, filterNotes]);

  const getTotalNotesByCategory = (category: string) => {
    if (category === 'All') {
      return notes.length;
    }
    return notes.filter((note) => note.category === category).length;
  };

  const handleAddNote = async () => {
    if (userId && title.trim() && category) {
      try {
        setIsAdding(true);
        const noteItem: Omit<Note, 'id'> = {
          title: title.trim() || undefined,
          note: noteText,
          completed: false,
          createdAt: new Date().toISOString(),
          category,
          userId: userId,
          startDate: startDate,
          endDate: endDate,
        };
        await addNote(noteItem);
        const fetchedNotes = await fetchNotes(userId);
        setNotes(fetchedNotes);
        setNoteText('');
        setTitle('');
        setShowDetails(false);
        setCategory('Select an option');
        setStartDate(undefined);
        setEndDate(undefined);
      } catch (error) {
        if (error instanceof Error) {
          Alert.alert('Error', `Failed to add note: ${error.message}`);
        } else {
          Alert.alert('Error', 'An unknown error occurred');
        }
      } finally {
        setIsAdding(false);
      }
    }
  };

  const confirmDelete = async (noteId: string) => {
    if (!noteId) return;
    if (userId) {
      await deleteNote(noteId);
      const fetchedNotes = await fetchNotes(userId);
      setNotes(fetchedNotes);
    }
  };

  const onRefresh = useCallback(async () => {
    if (!userId) return;
    setRefreshing(true);
    try {
      const fetchedNotes = await fetchNotes(userId);
      setNotes(fetchedNotes);
    } catch (error) {
      console.error('Error refreshing notes:', error);
    } finally {
      setRefreshing(false);
    }
  }, [userId]);

  const { colors } = useTheme();

  const styles = useMemo(() => {
    const sh = getShadow(colors.shadowColor);
    return StyleSheet.create({
      keyboardAvoidingView: {
        flex: 1,
        backgroundColor: colors.background,
      },
      safeArea: {
        flex: 1,
        backgroundColor: colors.background,
      },
      container: {
        flex: 1,
        marginHorizontal: 14,
      },
      inputSection: {
        paddingVertical: 4,
      },
      formCard: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: ui.radius.lg,
        padding: ui.spacing.md,
        ...sh,
        overflow: 'visible',
        elevation: Platform.OS === 'android' ? 2 : sh.elevation,
      },
      listContainer: {
        flex: 1,
        marginTop: 4,
      },
      stickyFilterContainer: {
        paddingBottom: 4,
        backgroundColor: colors.background,
      },
      flatList: {
        flex: 1,
      },
      listContentContainer: {
        paddingHorizontal: 2,
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
        padding: 12,
        borderWidth: 1,
        borderColor: colors.primary,
        backgroundColor: colors.surface,
        borderRadius: ui.radius.md,
        width: '100%',
        marginBottom: ui.spacing.md,
        minHeight: 64,
        color: colors.textPrimary,
      },
      inActiveInput: {
        fontSize: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: ui.radius.md,
        width: '100%',
        marginBottom: ui.spacing.md,
        minHeight: 64,
        backgroundColor: colors.surfaceSoft,
        color: colors.textMuted,
      },
      titleInputActive: {
        fontSize: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.primary,
        backgroundColor: colors.surface,
        borderRadius: ui.radius.md,
        width: '100%',
        marginBottom: ui.spacing.md,
        color: colors.textPrimary,
      },
      titleInputInactive: {
        fontSize: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: ui.radius.md,
        width: '100%',
        marginBottom: ui.spacing.md,
        backgroundColor: colors.surfaceSoft,
        color: colors.textMuted,
      },
      buttonContainer: {
        width: '100%',
        marginTop: 2,
      },
      button: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 13,
        marginBottom: 10,
        borderRadius: ui.radius.md,
        width: '100%',
      },
      buttonText: {
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: '600',
      } as TextStyle,
      addButtonText: {
        color: colors.surface,
        ...ui.typography.button,
      } as TextStyle,
      disabledButton: {
        backgroundColor: colors.disabled,
      },
      addButton: {
        backgroundColor: colors.primary,
      },
      pickerContainer: {
        marginBottom: ui.spacing.md,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderRadius: ui.radius.md,
        ...sh,
      },
      inputActiveWrapper: {
        borderColor: colors.primary,
      },
      inputInActiveWrapper: {
        borderColor: colors.border,
      },
      filterContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 4,
      },
      filterButton: {
        borderRadius: ui.radius.pill,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: 7,
        paddingHorizontal: 10,
        marginRight: 6,
      },
      filterButtonSelected: {
        backgroundColor: colors.surfaceSoft,
        borderColor: colors.primary,
      },
      filterButtonTextSelected: {
        color: colors.primaryDark,
      },
      modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.overlay,
      },
      modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: colors.surface,
        borderRadius: ui.radius.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
      },
      modalText: {
        fontSize: 18,
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
        fontSize: 16,
      },
      categoryContainer: {
        flexDirection: 'row',
      },
      helperText: {
        ...ui.typography.body,
        color: colors.textMuted,
        marginTop: 2,
        marginBottom: ui.spacing.xs,
      },
      detailsToggle: {
        paddingVertical: 6,
        marginBottom: ui.spacing.sm,
      },
      detailsToggleContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
      },
      detailsToggleText: {
        fontSize: 13,
        color: colors.primaryDark,
        fontWeight: '600',
      },
      detailsToggleTextDisabled: {
        color: colors.textMuted,
      },
      formScrollContent: {
        flexGrow: 1,
      },
      formToggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 2,
      },
      formToggleText: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.danger,
      },
      emptyState: {
        backgroundColor: colors.surface,
        borderRadius: ui.radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        padding: ui.spacing.xl,
        alignItems: 'center',
        marginTop: 10,
      },
      emptyStateTitle: {
        color: colors.textPrimary,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
      },
      emptyStateText: {
        color: colors.textSecondary,
        fontSize: 14,
        textAlign: 'center',
      },
    });
  }, [colors]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            onPress={() => setCalendarVisible(true)}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 7,
              backgroundColor: colors.surfaceSoft,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 99,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <MaterialCommunityIcons name="calendar-month" size={16} color={colors.primaryDark} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 7,
              backgroundColor: colors.surfaceSoft,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 99,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.primaryDark, fontSize: 13, fontWeight: '700' }}>⚙ Settings</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, colors, setCalendarVisible]);

  return (
    <KeyboardAvoidingView
      behavior={'padding'}
      style={styles.keyboardAvoidingView}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 60}
    >
      <SafeAreaView style={styles.safeArea}>
        <GestureHandlerRootView style={styles.container}>
          <View style={styles.inputSection}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.formScrollContent}
              ref={formScrollRef}
            >
            <View style={styles.formCard}>
              <TouchableOpacity style={styles.formToggleRow} onPress={() => setFormExpanded(p => !p)}>
                <MaterialCommunityIcons
                  name={formExpanded ? 'chevron-up-circle' : 'chevron-down-circle'}
                  size={20}
                  color={colors.danger}
                />
                <Text style={styles.formToggleText}>
                  {formExpanded ? 'Hide note form' : 'New note'}
                </Text>
              </TouchableOpacity>
              {formExpanded && (
              <View>
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
                    color: colors.textPrimary,
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
              placeholder={'Note'}
              onChangeText={(text: string) => setTitle(text.trimStart())}
              value={title}
              maxLength={80}
              multiline={false}
              editable={category !== 'Select an option'}
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity
              style={styles.detailsToggle}
              disabled={category === 'Select an option'}
              onPress={() => {
                setShowDetails((prev) => {
                  if (prev) {
                    setNoteText('');
                  }
                  return !prev;
                });
              }}
            >
              {title.trim().length >= 3 ? (
                <View style={styles.detailsToggleContent}>
                  <MaterialCommunityIcons
                    name={showDetails ? 'chevron-up-circle' : 'chevron-down-circle'}
                    size={16}
                    color={colors.danger}
                  />
                  <Text
                    style={[
                      styles.detailsToggleText,
                      category === 'Select an option' && styles.detailsToggleTextDisabled,
                    ]}
                  >
                    {showDetails ? 'Hide details' : 'Add details'}
                  </Text>
                </View>
              ) : null}              
            </TouchableOpacity>
            {title.trim().length >= 3 && showDetails ? (
              <TextInput
                ref={detailsInputRef}
                style={
                  category !== 'Select an option'
                    ? styles.activeInput
                    : styles.inActiveInput
                }
                placeholder={'Details (optional)'}
                onChangeText={(text: string) => setNoteText(text.trimStart())}
                value={noteText}
                maxLength={200}
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
                editable={category !== 'Select an option'}
                placeholderTextColor={colors.textMuted}
                onFocus={() => {
                  setTimeout(() => {
                    formScrollRef.current?.scrollToEnd({ animated: true });
                  }, 150);
                }}
              />
            ) : null}
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              disabled={title.trim().length < 3}
              onConfirm={(s, e) => { setStartDate(s); setEndDate(e); }}
              onClear={() => { setStartDate(undefined); setEndDate(undefined); }}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  title.trim().length < 3 || isAdding
                    ? styles.disabledButton
                    : styles.addButton,
                ]}
                disabled={title.trim().length < 3 || isAdding}
                onPress={title.trim().length >= 3 ? handleAddNote : () => {}}
              >
                <Text style={styles.addButtonText}>
                  {isAdding ? 'Adding note...' : 'Add note'}
                </Text>
              </TouchableOpacity>
            </View>
              </View>
              )}
            </View>
            </ScrollView>
          </View>
          <View style={styles.stickyFilterContainer}>
            <Text style={styles.helperText}>
              Tip: swipe left on completed notes to delete quickly.
            </Text>
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
                      {category} ({getTotalNotesByCategory(category)})
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
          <View style={styles.listContainer}>
            <FlatList
              data={filteredNotes}
              keyExtractor={(item) => item.id}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              renderItem={({ item }) => (
                <NoteItem
                  note={item}
                  onPress={() =>
                    navigation.navigate('Detail', { noteItem: item })
                  }
                  confirmDelete={confirmDelete}
                />
              )}
              contentContainerStyle={styles.listContentContainer}
              showsVerticalScrollIndicator={true}
              ListEmptyComponent={
                isLoading ? (
                  <View style={styles.emptyState}>
                    <ActivityIndicator size="large" color={colors.primary} />
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateTitle}>No notes yet</Text>
                    <Text style={styles.emptyStateText}>
                      Add your first note above to get started.
                    </Text>
                  </View>
                )
              }
              ListFooterComponent={<View style={styles.listFooter} />}
              ListHeaderComponent={<View style={styles.listHeader} />}
              style={styles.flatList}
            />
          </View>
        </GestureHandlerRootView>
      </SafeAreaView>
      <CalendarModal
        visible={calendarVisible}
        notes={notes}
        onClose={() => setCalendarVisible(false)}
        onNotePress={(note) => navigation.navigate('Detail', { noteItem: note })}
      />
    </KeyboardAvoidingView>
  );
};

export default NoteList;
