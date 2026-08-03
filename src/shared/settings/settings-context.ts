import { createContext } from 'react';

import type { SettingsStore } from './settings-store';

export const SettingsContext = createContext<SettingsStore | null>(null);
