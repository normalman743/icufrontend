import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n'; // Initialize i18n before App
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
// 移除 StrictMode 避免开发环境双次挂载导致所有 API 双重请求
root.render(
  <App />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
