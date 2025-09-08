import { configureStore } from '@reduxjs/toolkit';
import feedsReducer from './slices/feedsSlice';
import itemsReducer from './slices/itemsSlice';
import usersReducer from './slices/usersSlice';

export const store = configureStore({
  reducer: {
    feeds: feedsReducer,
    items: itemsReducer,
    users: usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
