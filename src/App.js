import React, { useState, useEffect } from 'react';
import DirectorySelector from './components/DirectorySelector';
import Sidebar from './components/SideBar';
import Chat from './components/Chat';
import { v4 as uuidv4 } from 'uuid';

const App = () => {
    const [files, setFiles] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [directoryPath, setDirectoryPath] = useState('');
    const [sessionId, setSessionId] = useState('');

    useEffect(() => {
        let storedSessionId = localStorage.getItem('session_id');
        if (!storedSessionId) {
            storedSessionId = uuidv4();
            localStorage.setItem('session_id', storedSessionId);
        }
        setSessionId(storedSessionId);
    }, []);

    const startNewChat = () => {
        const newSessionId = uuidv4();
        localStorage.setItem('session_id', newSessionId);
        setSessionId(newSessionId);
    };

    return (
        <div style={{ display: 'flex' }}>
            <div style={{ width: '300px', borderRight: '1px solid #ccc', padding: '10px' }}>
                <DirectorySelector 
                    setFiles={setFiles} 
                    setDirectoryPath={setDirectoryPath}
                />
                <button onClick={startNewChat} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#1e1e1e', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>
                    Start New Chat
                </button>
                <Sidebar
                    files={files}
                    setFiles={setFiles}
                    selectedFiles={selectedFiles}
                    setSelectedFiles={setSelectedFiles}
                    setSessionId={setSessionId}
                    setDirectoryPath={setDirectoryPath}
                    

                />
            </div>
            <div style={{ flex: 1, padding: '20px' }}>
                <Chat 
                    selectedFiles={selectedFiles} 
                    directoryPath={directoryPath} 
                    sessionId={sessionId}
                    setFiles={setFiles}
                />
            </div>
        </div>
    );
};

export default App;
