/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { Todo } from './types';
import { IconButton } from 'react-native-paper';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const SWIPE_THRESHOLD = -65;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface NoteItemProps {
  todo: Todo;
  onPress: () => void;
  confirmDelete: (todoId: string) => void;
}

const NoteItem: React.FC<NoteItemProps> = ({
  todo,
  onPress,
  confirmDelete,
}) => {
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(50);
  const [isSwipeOpen, setIsSwipeOpen] = useState(false);

  const gesture = Gesture.Pan()
    .activeOffsetX([-10, 10]) // Only activate gesture when horizontal movement exceeds 10 pixels
    .onChange((event) => {
      // Only allow swipe for completed todos
      if (!todo.completed) {
        translateX.value = 0;
        return;
      }

      if (event.translationX <= 0) {
        // Limit the swipe to SWIPE_THRESHOLD
        translateX.value = Math.max(event.translationX, SWIPE_THRESHOLD);
      } else if (!isSwipeOpen) {
        translateX.value = 0;
      }
    })
    .onEnd(() => {
      // If not completed, ensure it stays in place
      if (!todo.completed) {
        translateX.value = 0;
        return;
      }

      // If swiped more than halfway to threshold, open fully
      if (translateX.value < SWIPE_THRESHOLD / 2) {
        translateX.value = withSpring(SWIPE_THRESHOLD);
        runOnJS(setIsSwipeOpen)(true);
      } else {
        translateX.value = withSpring(0);
        runOnJS(setIsSwipeOpen)(false);
      }
    });

  const handleDelete = () => {
    translateX.value = withSpring(-SCREEN_WIDTH);
    itemHeight.value = withSpring(0);
    setIsSwipeOpen(false);
    confirmDelete(todo.id);
  };

  const rStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: translateX.value,
      },
    ],
  }));

  const rIconContainerStyle = useAnimatedStyle(() => {
    // Only show delete container when fully swiped
    const isFullyOpen = translateX.value <= SWIPE_THRESHOLD;
    return {
      opacity: isFullyOpen ? 1 : 0,
      // Hide the container completely when not fully swiped
      transform: [{ translateX: isFullyOpen ? 0 : 100 }],
      pointerEvents: isFullyOpen ? 'auto' : 'none',
      backgroundColor: '#f7f7f7',
    };
  });

  const rTaskContainerStyle = useAnimatedStyle(() => {
    return {
      height: itemHeight.value,
    };
  });

  const isOlderThan3Days = () => {
    try {
      const now = new Date();
      const createdDate = new Date(todo.createdAt);
      const daysDifference =
        (now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
      return daysDifference > 3;
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', `Checking date: ${error.message}`);
      } else {
        Alert.alert('Error', 'An unknown error occurred');
      }
      return false;
    }
  };

  const displayTitle =
    todo.title && todo.title.trim().length > 0 ? todo.title : todo.todo;

  return (
    <Animated.View style={[styles.rowContainer, rTaskContainerStyle]}>
      <View style={styles.container}>
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.swipeableContent, rStyle]}>
            <TouchableOpacity 
              style={[styles.innerContainer, isOlderThan3Days() && styles.oldTodo]}
              onPress={onPress}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.todoText,
                  todo.completed ? styles.completed : styles.notCompleted,
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {displayTitle}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </GestureDetector>
        <Animated.View style={[styles.deleteContainer, rIconContainerStyle]}>
          <TouchableOpacity
            onPress={handleDelete}
            style={[styles.deleteButton]}
            activeOpacity={0.7}
          >
            <IconButton
              icon="trash-can"
              size={36}
              iconColor="#ff4444"
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    flex: 1,
    width: '100%',
    marginBottom: 16,
    marginTop: 6,
  },
  container: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  swipeableContent: {
    flex: 1,
    width: '100%',
  },
  innerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196f3',
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 14,
    minHeight: 65,
  },
  todoText: {
    flex: 1,
    fontSize: 17,
    textAlignVertical: 'center',
    paddingVertical: 2,
  },
  completed: {
    textDecorationLine: 'line-through',
    color: '#0f0f0f',
    fontWeight: '400',
  },
  notCompleted: {
    color: '#ffffff',
    fontWeight: '400',
  },
  deleteContainer: {
    width: Math.abs(SWIPE_THRESHOLD),
    position: 'absolute',
    right: 0,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
  },
  deleteButton: {
    marginTop: 5,
    width: Math.abs(SWIPE_THRESHOLD),
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  oldTodo: {
    backgroundColor: '#dca470',
  },
});

export default NoteItem;
