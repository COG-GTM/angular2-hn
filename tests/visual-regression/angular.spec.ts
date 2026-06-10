import { test } from '@playwright/test';
import { runVisualMatrix } from './helpers';

/**
 * Captures the Angular baseline screenshots. Run with --update-snapshots to (re)generate
 * the shared baseline PNGs that the React port is compared against.
 */
test.describe('Angular baseline', () => {
    runVisualMatrix(test);
});
