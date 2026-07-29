export type Theme = 'default' | 'night' | 'amoledblack';

export interface Settings {
    showSettings: boolean;
    /** Masks balances and cashback amounts so the screen is safe to show in public. */
    maskAmounts: boolean;
    theme: Theme;
    titleFontSize: string;
    listSpacing: string;
}
