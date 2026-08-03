import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { setPrefersDarkColorScheme } from '../../test/matchMedia';
import { createSettingsStore } from './settings-store';

describe('createSettingsStore', () => {
    beforeEach(() => {
        localStorage.clear();
        setPrefersDarkColorScheme(false);
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('starts from defaults when nothing is persisted', () => {
        const store = createSettingsStore();

        expect(store.getSettings()).toEqual({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
    });

    it('restores persisted settings', () => {
        localStorage.setItem('theme', 'amoledblack');
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '5');

        const store = createSettingsStore();

        expect(store.getSettings()).toMatchObject({
            theme: 'amoledblack',
            openLinkInNewTab: true,
            titleFontSize: '20',
            listSpacing: '5',
        });
    });

    it('falls back to the night theme when the system prefers dark and nothing is persisted', () => {
        setPrefersDarkColorScheme(true);

        const store = createSettingsStore();

        expect(store.getSettings().theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');
    });

    it('keeps a persisted theme even when the system prefers dark', () => {
        localStorage.setItem('theme', 'default');
        setPrefersDarkColorScheme(true);

        expect(createSettingsStore().getSettings().theme).toBe('default');
    });

    it('follows later system color scheme changes', () => {
        const store = createSettingsStore();

        setPrefersDarkColorScheme(true);
        expect(store.getSettings().theme).toBe('night');

        setPrefersDarkColorScheme(false);
        expect(store.getSettings().theme).toBe('default');
    });

    it('stops following system changes once destroyed', () => {
        const store = createSettingsStore();
        store.destroy();

        setPrefersDarkColorScheme(true);

        expect(store.getSettings().theme).toBe('default');
    });

    it('toggles the settings panel without persisting it', () => {
        const store = createSettingsStore();

        store.toggleSettings();
        expect(store.getSettings().showSettings).toBe(true);
        expect(localStorage.getItem('showSettings')).toBeNull();

        store.toggleSettings();
        expect(store.getSettings().showSettings).toBe(false);
    });

    it('persists the open-links-in-new-tab preference', () => {
        const store = createSettingsStore();

        store.toggleOpenLinksInNewTab();

        expect(store.getSettings().openLinkInNewTab).toBe(true);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('persists theme, font size and list spacing', () => {
        const store = createSettingsStore();

        store.setTheme('night');
        store.setFont('22');
        store.setSpacing('8');

        expect(store.getSettings()).toMatchObject({ theme: 'night', titleFontSize: '22', listSpacing: '8' });
        expect(localStorage.getItem('theme')).toBe('night');
        expect(localStorage.getItem('titleFontSize')).toBe('22');
        expect(localStorage.getItem('listSpacing')).toBe('8');
    });

    it('notifies subscribers until they unsubscribe', () => {
        const store = createSettingsStore();
        const listener = vi.fn();

        const unsubscribe = store.subscribe(listener);
        store.toggleSettings();
        expect(listener).toHaveBeenCalledTimes(1);

        unsubscribe();
        store.toggleSettings();
        expect(listener).toHaveBeenCalledTimes(1);
    });
});
