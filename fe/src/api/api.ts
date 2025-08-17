// src/api/api.ts
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api', // Ganti dengan URL backend Anda
    timeout: 10000, // Batas waktu 10 detik
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;