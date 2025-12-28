/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NoteDetail from '../NoteDetail';
import * as firebaseService from '../../service/firebaseService';

jest.mock('../../service/firebaseService', () => ({
  updateNote: jest.fn().mockResolvedValue(undefined),
  deleteNote: jest.fn().mockResolvedValue(undefined),
  toggleStatus: jest.fn().mockResolvedValue(undefined),
}));

const createProps = () => {
  return {
    route: {
      params: {
        noteItem: {
          id: '1',
          title: '',
          note: 'Test note',
          completed: false,
        },
      },
    },
    navigation: {
      goBack: jest.fn(),
    },
  } as any;
};

describe('NoteDetail screen', () => {
  it('renders input and action buttons', () => {
    const props = createProps();
    const { getByPlaceholderText, getByText } = render(
      <NoteDetail {...props} />,
    );

    expect(getByPlaceholderText('Edit note (optional)')).toBeTruthy();
    expect(getByText('Update note')).toBeTruthy();
    expect(getByText('Delete note')).toBeTruthy();
    expect(getByText('Mark as Complete')).toBeTruthy();
  });

  it('calls updateNote and navigates back when Update note is pressed', async () => {
    const props = createProps();
    const { getByText, getByPlaceholderText } = render(
      <NoteDetail {...props} />,
    );

    const input = getByPlaceholderText('Edit note (optional)');
    const updatedText = 'Updated note';

    fireEvent.changeText(input, updatedText);

    const updateButton = getByText('Update note');
    fireEvent.press(updateButton);

    await waitFor(() => {
      expect(firebaseService.updateNote).toHaveBeenCalledWith('1', {
        title: undefined,
        note: updatedText,
      });
      expect(props.navigation.goBack).toHaveBeenCalled();
    });
  });
});
