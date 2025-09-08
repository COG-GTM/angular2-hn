import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Story } from '../../types';

interface ItemsState {
  [key: number]: {
    item: Story | null;
    loading: boolean;
    error: string | null;
  };
}

const initialState: ItemsState = {};

export const fetchItem = createAsyncThunk(
  'items/fetchItem',
  async (id: number) => {
    const response = await fetch(`https://node-hnapi.herokuapp.com/item/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch item ${id}`);
    }
    const item = await response.json();
    return { id, item };
  }
);

const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchItem.pending, (state, action) => {
        const id = action.meta.arg;
        if (!state[id]) {
          state[id] = { item: null, loading: false, error: null };
        }
        state[id].loading = true;
        state[id].error = null;
      })
      .addCase(fetchItem.fulfilled, (state, action) => {
        const { id, item } = action.payload;
        if (!state[id]) {
          state[id] = { item: null, loading: false, error: null };
        }
        state[id].item = item;
        state[id].loading = false;
      })
      .addCase(fetchItem.rejected, (state, action) => {
        const id = action.meta.arg;
        if (!state[id]) {
          state[id] = { item: null, loading: false, error: null };
        }
        state[id].loading = false;
        state[id].error = action.error.message || 'Failed to fetch item';
      });
  },
});

export default itemsSlice.reducer;
