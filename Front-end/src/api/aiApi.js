import axiosClient from './axiosClient';

const aiApi = {
    // Lấy 10 tin nhắn gần nhất
    getHistory: () => {
        return axiosClient.get('/ai/history/');
    },
    // Gửi tin nhắn mới
    sendMessage: (message) => {
        return axiosClient.post('/ai/chat/', { message });
    }
};

export default aiApi;
