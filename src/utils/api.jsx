// src/API.js
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:8000/api/';
console.log("🔍 AXIOS BASE URL:", baseURL);

const API = axios.create({
  baseURL,
  withCredentials: true,
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
