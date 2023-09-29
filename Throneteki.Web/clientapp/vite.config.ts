import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        proxy: {
            '/api': {
                target: 'https://localhost:5287',
                secure: false,
                changeOrigin: true
            },
            '/img': {
                target: 'https://localhost:5287',
                secure: false,
                changeOrigin: true
            },
            '/lobbyhub': {
                target: 'ws://localhost:7010',
                ws: true
            }
        }
    },
    plugins: [react()]
});
