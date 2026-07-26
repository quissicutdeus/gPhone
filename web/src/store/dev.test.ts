import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { devToolsVisible, toggleDevTools, showDevTools, hideDevTools } from './dev';

describe('Dev Store', () => {
    beforeEach(() => {
        showDevTools();
    });

    it('defaults to visible in browser mode', () => {
        expect(get(devToolsVisible)).toBe(true);
    });

    it('toggles dev tools visibility', () => {
        hideDevTools();
        expect(get(devToolsVisible)).toBe(false);

        showDevTools();
        expect(get(devToolsVisible)).toBe(true);

        toggleDevTools();
        expect(get(devToolsVisible)).toBe(false);
    });
});
