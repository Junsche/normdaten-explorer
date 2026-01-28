import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api-os': {
        target: 'https://141.13.17.217:9200',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-os/, ''),
        secure: false, // 忽略自签名证书
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            /**
             * 解决方案：直接硬编码 Base64 字符串
             * 对应 "frontend_user:vs{Du$r9;q-dCXuQ"
             * 这样就排除了 Vite 加载 .env 时对特殊字符解析出错的可能性
             */
            const authStr = 'ZnJvbnRlbmRfdXNlcjp2c3tEdSRyOTtxLWRDWHVR';
            proxyReq.setHeader('Authorization', `Basic ${authStr}`);
          });
          proxy.on('proxyRes', (proxyRes) => {
            // 移除响应头，防止浏览器弹出自带的 401 登录框
            if (proxyRes.headers['www-authenticate']) {
              delete proxyRes.headers['www-authenticate'];
            }
          });
        },
      }
    }
  }
})