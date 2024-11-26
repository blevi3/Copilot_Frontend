// api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
});

export const selectDirectory = (path) => api.post('/files/select-directory/', { path });

export const askQuestion = (question, selected_files, directoryPath, sessionId) => {
    try {
        const formattedFiles = selected_files.map((filePath) => {
            const name = filePath.split('/').pop();  // Extract the file name from the path
            return { name, path: filePath };
        });

        const response = api.post('/chat/ask/', {
            question: question,
            selected_files: formattedFiles,
            directory_path: directoryPath,
            session_id: sessionId,  // Include session ID in request
        });

        return response;  // Return the full response
    } catch (error) {
        throw new Error('Failed to send question: ' + error.message);
    }
};

// New API function to fetch chat history
export const getChatHistory = (sessionId) => {
    try {
        const response = api.get(`/chat/history/`, {
            params: { session_id: sessionId }  // Pass session_id as a query parameter
        });
        return response;  // Return the response containing the chat history
    } catch (error) {
        throw new Error('Failed to fetch chat history: ' + error.message);
    }
};

export default api;
