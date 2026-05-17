import axiosClient from './axiosClient';

const lessonApi = {
    getAll: () => axiosClient.get('/lessons/'),
    getById: (id) => axiosClient.get(`/lessons/${id}/`),
    create: (data) => axiosClient.post('/lessons/', data),
    update: (id, data) => axiosClient.patch(`/lessons/${id}/`, data),
    remove: (id) => axiosClient.delete(`/lessons/${id}/`),
    gradeStage: (stageNumber, code) => axiosClient.post('/lessons/grade/', { stage_number: stageNumber, code }),
    getStageProgress: () => axiosClient.get('/lessons/progress/'),
    updateTitle: (title) => axiosClient.post('/lessons/update-title/', { title }),
};

export default lessonApi;
