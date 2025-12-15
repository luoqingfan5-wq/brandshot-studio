import React from 'react';
import ReactDOM from 'react-dom/client';
// 🚀 修复点：明确指出文件扩展名是 .tsx
import App from './App.tsx'; 
// 假设您的样式文件是 index.css。如果您的项目中使用的是 main.css 或其他名称，请修改下面这行。
import './index.css'; 

// 使用 React 18 的 createRoot API
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  // 移除 StrictMode 以解决 DOM 冲突
  <App />
);