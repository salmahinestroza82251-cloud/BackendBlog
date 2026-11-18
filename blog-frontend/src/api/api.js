import axios from 'axios';

// Detecta automáticamente si entras por localhost o por la IP de red (ej. 192.168.1.37)
const host = window.location.hostname || 'localhost';

const API = axios.create({
  baseURL: `http://${host}:4000/api`,
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