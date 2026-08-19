import react from '@vitejs/plugin-react';
import selectorParser from 'postcss-selector-parser';
import { defineConfig } from 'vite';

interface ScssRule {
    selectors: string[];
    parent?: { type: string; name?: string } | undefined;
}

interface ScssRoot {
    source?: { input: { file?: string } };
    walkRules(callback: (rule: ScssRule) => void): void;
}

/**
 * Reproduces Angular's emulated view encapsulation for the reused
 * `*.component.scss` files: every selector is narrowed to elements carrying the
 * component's `data-c-<name>` attribute, `:host` becomes `data-h-<name>`, and
 * `>>>` keeps its descendants unscoped. Components apply those attributes with
 * the `content()` / `host()` helpers in src/react/scope.ts.
 */
function componentScope() {
    return {
        postcssPlugin: 'component-scope',
        Once(root: ScssRoot) {
            const file = root.source?.input.file;
            const name = file && /([\w-]+)\.component\.scss$/.exec(file)?.[1];

            if (!name) {
                return;
            }

            const contentAttribute = `[data-c-${name}]`;
            const hostAttribute = `[data-h-${name}]`;

            root.walkRules(rule => {
                const parent = rule.parent;

                if (parent?.type === 'atrule' && /keyframes$/.test(parent.name ?? '')) {
                    return;
                }

                rule.selectors = rule.selectors.map(selector => {
                    if (selector.includes('>>>') || selector.includes('::ng-deep')) {
                        return selector
                            .replace(/:host\s*/, '')
                            .replace(/(>>>|::ng-deep)\s*/, `${hostAttribute} `)
                            .trim();
                    }

                    if (selector.includes(':host')) {
                        return selector.replace(/:host/g, hostAttribute);
                    }

                    return scopeSelector(selector, contentAttribute);
                });
            });
        },
    };
}

function scopeSelector(selector: string, attribute: string): string {
    return selectorParser(selectors => {
        selectors.each(complex => {
            const nodes = complex.nodes;
            let insertAt = nodes.length;

            for (let i = nodes.length - 1; i >= 0; i--) {
                const node = nodes[i];

                if (node.type === 'combinator') {
                    break;
                }

                if (node.type === 'pseudo' || node.type === 'comment') {
                    insertAt = i;
                }
            }

            const scopeNode = selectorParser.attribute({
                attribute: attribute.slice(1, -1),
                value: undefined,
                raws: {},
            });

            if (insertAt === nodes.length) {
                complex.append(scopeNode);
            } else {
                complex.insertBefore(nodes[insertAt], scopeNode);
            }
        });
    }).processSync(selector);
}

export default defineConfig({
    plugins: [react()],
    css: {
        postcss: {
            plugins: [componentScope()],
        },
    },
    build: {
        outDir: 'dist/react-hnpwa',
        emptyOutDir: true,
    },
});
