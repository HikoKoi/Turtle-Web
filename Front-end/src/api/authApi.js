import axiosClient from './axiosClient';

const authApi = {
    register: (data) => axiosClient.post('/users/register/', data),
    login: (data) => axiosClient.post('/users/login/', data),
    logout: (data) => axiosClient.post('/users/logout/', data),
    getMe: () => axiosClient.get('/users/me/'),
    updateProfile: (data) => axiosClient.patch('/users/update_profile/', data),
    changePassword: (data) => axiosClient.post('/users/change_password/', data),
    sendOtp: (data) => axiosClient.post('/users/send-otp/', data),
    verifyOtp: (data) => axiosClient.post('/users/verify-otp/', data),
};

export default authApi;
