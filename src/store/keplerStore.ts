// KEPLER STORE COMMENTED OUT - DEPENDENCY ISSUES
// Simple store for now

import { createStore } from 'redux';

const simpleReducer = (state = {}, action: any) => {
  switch (action.type) {
    default:
      return state;
  }
};

export const store = createStore(simpleReducer);

export type RootState = {};