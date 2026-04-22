import { defineConfig } from 'vitest/config'

// 单元测试配置（与生产构建分离）
// - 仅测试 utils/ 下的纯函数，使用 node 环境即可，无需 DOM
// - 不引入 React / jsdom，保持启动速度最快
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    globals: false,
    reporters: 'default',
  },
})
