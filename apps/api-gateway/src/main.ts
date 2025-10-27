const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const http = require('http');

const app = express();
const PORT = 4000;

// --- CORS ---
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// --- Middleware logujący przychodzące żądania ---
app.use((req: any, res: any, next: any) => {
  console.log(`➡️ [INCOMING REQUEST] ${req.method} ${req.originalUrl}`);
  next();
});

// app.use('/api/products', (req: any, res: any, next: any) => {
//   console.log('🔥 INSIDE AN /api/products');
//   next();
// });


// Proxy do Products Service
app.use('/api/products', createProxyMiddleware({
  target: 'http://localhost:3000/',
  changeOrigin: true,
  logLevel: 'debug',
  onProxyReq(proxyReq: any, req: any, res: any) {
    console.log('--- 🟢 Proxy Request ---');
    console.log('Incoming URL:', req.originalUrl);
    console.log('Outgoing URL:', proxyReq.path);
    console.log('Method:', proxyReq.method);
    console.log('------------------------');
  },
  onProxyRes(proxyRes: any, req: any, res: any) {
    console.log('--- 🟡 Proxy Response ---');
    console.log('Status code:', proxyRes.statusCode);
    console.log('For request URL:', req.originalUrl);
    console.log('-------------------------');
  }
}));

// Proxy do Orders Service
app.use('/api/orders', createProxyMiddleware({
  target: 'http://localhost:3002/',
  changeOrigin: true,
  logLevel: 'debug',
  // 🟢 Poprawione: wysyłamy do /api/orders, bo mikroserwis ma globalny prefix /api
//   pathRewrite: { '^/api/orders': '/api/orders' },
  onProxyReq(proxyReq: any, req: any, res: any) {
    const targetUrl = `${proxyReq.protocol || 'http:'}//${proxyReq.host}${proxyReq.path}`;
    console.log('--- 🟢 Proxy Request ---');
    console.log('➡️ Incoming URL:', req.originalUrl);
    console.log('➡️ Outgoing (target) URL:', targetUrl);
    console.log('Method:', proxyReq.method);
    console.log('Headers:', proxyReq.getHeaders());
    console.log('------------------------');
  },
  onProxyRes(proxyRes: any, req: any, res: any) {
    console.log('--- 🟡 Proxy Response ---');
    console.log('Status code:', proxyRes.statusCode);
    console.log('Response headers:', proxyRes.headers);
    console.log('For request URL:', req.originalUrl);
    console.log('-------------------------');
  }
}));

// --- Health check API Gateway ---
app.get('/api', (req: any, res: any) => {
  res.json({ service: 'api-gateway', status: 'ok' });
});

// --- Start serwera ---
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on http://localhost:${PORT}/api`);
});
