import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Story } from '../../types';

interface FeedsState {
  [key: string]: {
    stories: Story[];
    loading: boolean;
    error: string | null;
    currentPage: number;
  };
}

const initialState: FeedsState = {};

export const fetchFeed = createAsyncThunk(
  'feeds/fetchFeed',
  async ({ feedType, page }: { feedType: string; page: number }) => {
    const response = await fetch(`https://node-hnapi.herokuapp.com/${feedType}?page=${page}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${feedType} feed`);
    }
    const stories = await response.json();
    return { feedType, page, stories };
  }
);

const feedsSlice = createSlice({
  name: 'feeds',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state, action) => {
        const { feedType } = action.meta.arg;
        if (!state[feedType]) {
          state[feedType] = { stories: [], loading: false, error: null, currentPage: 1 };
        }
        state[feedType].loading = true;
        state[feedType].error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        const { feedType, page, stories } = action.payload;
        if (!state[feedType]) {
          state[feedType] = { stories: [], loading: false, error: null, currentPage: 1 };
        }
        state[feedType].stories = stories;
        state[feedType].loading = false;
        state[feedType].currentPage = page;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        const { feedType } = action.meta.arg;
        if (!state[feedType]) {
          state[feedType] = { stories: [], loading: false, error: null, currentPage: 1 };
        }
        state[feedType].loading = false;
        state[feedType].error = action.error.message || 'Failed to fetch feed';
      });
  },
});

export default feedsSlice.reducer;
