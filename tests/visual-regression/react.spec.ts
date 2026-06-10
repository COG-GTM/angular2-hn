import { test } from '@playwright/test';
import { runVisualMatrix } from './helpers';

/**
 * Renders the React port through the exact same scenario matrix as the Angular baseline and
 * asserts pixel parity against the shared baseline PNGs (no --update-snapshots here).
 */
test.describe('React port', () => {
    runVisualMatrix(test);
});
