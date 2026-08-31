import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { SettingsProvider, useSettings } from './SettingsContext';

describe('SettingsContext', () => {
    beforeEach(() => localStorage.clear());
    it('persists settings changes', () => {
        const { result } = renderHook(() => useSettings(), { wrapper: SettingsProvider });
        act(() => result.current.setTheme('night'));
        act(() => result.current.toggleOpenLinksInNewTab());
        expect(result.current.settings.theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });
});
