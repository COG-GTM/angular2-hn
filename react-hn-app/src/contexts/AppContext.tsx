import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface AppState {
  theme: string;
  settings: {
    showSettings: boolean;
    openLinkInNewTab: boolean;
    theme: string;
    titleFontSize: string;
    listSpacing: string;
  };
}

interface AppAction {
  type: string;
  payload?: any;
}

const initialState: AppState = {
  theme: 'default',
  settings: {
    showSettings: false,
    openLinkInNewTab: false,
    theme: 'default',
    titleFontSize: '16',
    listSpacing: '0',
  },
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
        settings: { ...state.settings, theme: action.payload },
      };
    case 'TOGGLE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, showSettings: !state.settings.showSettings },
      };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
