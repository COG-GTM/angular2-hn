import * as core from './index';

describe('core index', () => {
    it('exports the layout components and tracking hook', () => {
        expect(core.AppLayout).toBeTypeOf('function');
        expect(core.Header).toBeTypeOf('function');
        expect(core.Footer).toBeTypeOf('function');
        expect(core.Settings).toBeTypeOf('function');
        expect(core.usePageviewTracking).toBeTypeOf('function');
    });
});
