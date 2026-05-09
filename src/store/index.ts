import { configureStore } from '@reduxjs/toolkit';
import categoriesReducer from './slices/categoriesSlice';
import recordsReducer from './slices/recordsSlice';
import configReducer from './slices/configSlice';

export const store = configureStore({
  reducer: {
    categories: categoriesReducer,
    records: recordsReducer,
    config: configReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
