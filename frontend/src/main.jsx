import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// Global axios interceptor: token süresi dolduğunda otomatik logout
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      // Login sayfasındaysa döngüye girmesin
      if (!currentPath.includes('/admin/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
