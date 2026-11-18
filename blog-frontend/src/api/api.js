import axios from 'axios';

const host = window.location.hostname || 'localhost';
const backendUrl = import.meta.env.VITE_API_URL || `http://${host}:4000`;

const API = axios.create({
  baseURL: `${backendUrl}/api`,
});

// Interceptor para enviar el token en cada petición si existe
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;