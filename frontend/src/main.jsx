import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// Production'da direkt Render backend'e bağlan (Netlify proxy limit'ini aşmak için)
const API_BASE = import.meta.env.VITE_API_URL || '';
if (API_BASE) {
  axios.defaults.baseURL = API_BASE;
}

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
     
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
