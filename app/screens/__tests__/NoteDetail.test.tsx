/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NoteDetail from '../NoteDetail';
import * as noteActions from '../../service/noteActions';

const mockNote = {
  id: '1',
  title: '',
  note: 'Test note',
  completed: false,
  createdAt: '2025-01-01T00:00:00.000Z',
};

jest.mock('../../service/noteActions', () => ({
  updateNoteWithReminder: jest.fn().mockResolvedValue(true),
  deleteNoteWithReminder: jest.fn().mockResolvedValue(true),
  toggleNoteStatus: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../context/NotesContext', () => ({
  useNotesContext: () => ({
    getNoteById: (id: string) => (id === '1' ? mockNote : undefined),
    loading: false,
    toggleNoteOptimistic: jest.fn().mockResolvedValue(true),
  }),
}));

jest.mock('../../hooks/useCategories', () => ({
  useCategories: () => ({
    quickAddCategories: ['Home', 'Shopping'],
  }),
}));

jest.mock('../../../firebaseConfig', () => ({
  FIREBASE_AUTH: { currentUser: { uid: 'test-user' } },
}));

const createProps = () => {
  return {
    route: {
      params: {
        noteId: '1',
      },
    },
    navigation: {
      goBack: jest.fn(),
      canGoBack: jest.fn(() => true),
      navigate: jest.fn(),
      addListener: jest.fn(() => jest.fn()),
      dispatch: jest.fn(),
    },
  } as any;
};

describe('NoteDetail screen', () => {
  it('renders input and action buttons', () => {
    const props = createProps();
    const { getByPlaceholderText, getByText, getAllByText } = render(
      <NoteDetail {...props} />,
    );

    expect(getByPlaceholderText('Detail note (optional)')).toBeTruthy();
    expect(getAllByText('Update note').length).toBeGreaterThan(0);
    expect(getByText('Delete note')).toBeTruthy();
    expect(getByText('Mark as Complete')).toBeTruthy();
  });

  it('calls updateNoteWithReminder and navigates back when Update note is pressed', async () => {
    const props = createProps();
    const { getByText, getByPlaceholderText, getAllByText } = render(
      <NoteDetail {...props} />,
    );

    const input = getByPlaceholderText('Detail note (optional)');
    const updatedText = 'Updated note';

    fireEvent.changeText(input, updatedText);

    const updateButton = getAllByText('Update note').at(-1)!;
    fireEvent.press(updateButton);

    await waitFor(() => {
      expect(noteActions.updateNoteWithReminder).toHaveBeenCalledWith(
        '1',
        {
          title: undefined,
          note: updatedText,
          startDate: undefined,
          endDate: undefined,
          category: undefined,
        },
        {
          id: '1',
          title: undefined,
          note: updatedText,
          endDate: undefined,
        },
      );
      expect(props.navigation.goBack).toHaveBeenCalled();
    });
  });
});
