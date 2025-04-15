import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.example.com', // Replace with your actual API base URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const removeAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
};

export default api; 