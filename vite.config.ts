import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

const reactEntry: Plugin = {
    name: 'react-entry',
    transformIndexHtml() {
        return [
            {
                tag: 'script',
                attrs: {
                    type: 'module',
                    src: '/main.tsx',
                },
                injectTo: 'body',
            },
        ];
    },
};

export default defineConfig({
    root: 'src',
    plugins: [react(), reactEntry],
});
