export type Theme = 'default' | 'night' | 'amoledblack';

export interface Settings {
    theme: Theme;
    fontSize: number;
    listSpacing: number;
}

export const DEFAULT_SETTINGS: Settings = {
    theme: 'default',
    fontSize: 16,
    listSpacing: 1,
};
