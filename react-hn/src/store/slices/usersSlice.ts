import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { User } from '../../types';

interface UsersState {
  [key: string]: {
    user: User | null;
    loading: boolean;
    error: string | null;
  };
}

const initialState: UsersState = {};

export const fetchUser = createAsyncThunk(
  'users/fetchUser',
  async (id: string) => {
    const response = await fetch(`https://node-hnapi.herokuapp.com/user/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user ${id}`);
    }
    const user = await response.json();
    return { id, user };
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state, action) => {
        const id = action.meta.arg;
        if (!state[id]) {
          state[id] = { user: null, loading: false, error: null };
        }
        state[id].loading = true;
        state[id].error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        const { id, user } = action.payload;
        if (!state[id]) {
          state[id] = { user: null, loading: false, error: null };
        }
        state[id].user = user;
        state[id].loading = false;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        const id = action.meta.arg;
        if (!state[id]) {
          state[id] = { user: null, loading: false, error: null };
        }
        state[id].loading = false;
        state[id].error = action.error.message || 'Failed to fetch user';
      });
  },
});

export default usersSlice.reducer;
