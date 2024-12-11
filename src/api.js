import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
});

export const selectDirectory = (path) => api.post('/files/select-directory/', { path });

export const askQuestion = (question, selected_files, directoryPath, sessionId) => {
    try {
        const formattedFiles = selected_files.map((filePath) => {
            const name = filePath.split('/').pop();
            return { name, path: filePath };
        });

        const response = api.post('/chat/ask/', {
            question: question,
            selected_files: formattedFiles,
            directory_path: directoryPath,
            session_id: sessionId,
        });

        return response;
    } catch (error) {
        throw new Error('Failed to send question: ' + error.message);
    }
};

export const getChatHistory = async (sessionId) => {
    try {
        const response = await api.get(`/chat/history/`, {
            params: { session_id: sessionId }
        });
        return response;
    } catch (error) {
        throw new Error('Failed to fetch chat history: ' + error.message);
    }
};


export const getAllConversations = () => api.get('/chat/conversations/');

export const getModifiedFiles = async (directoryPath) => {
    const response = await api.get('/files/modified-files/', { params: { directory: directoryPath } });
    return response;

}

export const revertFile = (filePath) =>{
    api.post(`/files/revert-file/?file_path=${encodeURIComponent(filePath)}`);
}
export default api;
