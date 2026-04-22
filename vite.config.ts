import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/DataVisualisation/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // 代码分割：把体积最大的 echarts/zrender 与 react/router 拆成独立 chunk
    // 目的：初始下载只加载 React 骨架，echarts 在生成器页首次渲染时懒加载
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('echarts') || id.includes('zrender')) {
              return 'echarts'
            }
            if (
              id.includes('react-router') ||
              id.includes('/react/') ||
              id.includes('/react-dom/')
            ) {
              return 'react-vendor'
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
})
