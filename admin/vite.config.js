import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
function createManualChunks(id) {
    if (!id.includes('node_modules')) {
        return undefined;
    }
    if (id.includes('element-plus') || id.includes('@element-plus')) {
        return 'element-plus';
    }
    if (id.includes('vue-router')) {
        return 'router-vendor';
    }
    if (id.includes('pinia')) {
        return 'state-vendor';
    }
    if (id.includes('axios') || id.includes('dayjs')) {
        return 'utility-vendor';
    }
    return 'vendor';
}
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
        extensions: ['.mjs', '.ts', '.tsx', '.js', '.jsx', '.json', '.vue'],
    },
    build: {
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: createManualChunks,
            },
        },
    },
    server: {
        host: '0.0.0.0',
        port: 5174,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8081',
                changeOrigin: true,
            },
        },
    },
});
//# sourceMappingURL=vite.config.js.map