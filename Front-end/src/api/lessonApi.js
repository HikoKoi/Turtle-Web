import axiosClient from './axiosClient';

const lessonApi = {
    getAll: () => axiosClient.get('/lessons/'),
    getById: (id) => axiosClient.get(`/lessons/${id}/`),
    create: (data) => axiosClient.post('/lessons/', data),
    update: (id, data) => axiosClient.patch(`/lessons/${id}/`, data),
    remove: (id) => axiosClient.delete(`/lessons/${id}/`),
};

export default lessonApi;
