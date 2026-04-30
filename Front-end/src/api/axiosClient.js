import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const axiosClient = axios.create({
    baseURL: API_BASE_URL,
});

// Gắn JWT vào mỗi request
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Tự động refresh token khi bị 401
axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');

            if (!refreshToken) {
                localStorage.clear();
                window.location.href = '/auth';
                return Promise.reject(error);
            }

            try {
                const { data } = await axios.post(`${API_BASE_URL}/users/token/refresh/`, {
                    refresh: refreshToken,
                });
                localStorage.setItem('access_token', data.access);
                originalRequest.headers.Authorization = `Bearer ${data.access}`;
                return axiosClient(originalRequest);
            } catch (refreshError) {
                localStorage.clear();
                window.location.href = '/auth';
                return Promise.reject(refreshError);
            }
        }

        // Xử lý lỗi hệ thống nghiêm trọng (500, rớt mạng, ...)
        if (!error.response) {
            alert('🚨 Ôi! Có vẻ như máy chủ Rùa đang bận hoặc mạng của bé bị yếu. Bé thử lại sau nhé!');
        } else if (error.response.status >= 500) {
            alert('🚨 Máy chủ Rùa đang gặp một chút rắc rối kỹ thuật. Các Hiệp sĩ đang sửa chữa ngay đây!');
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
