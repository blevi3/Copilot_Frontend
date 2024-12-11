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
            <div style={{}}>
                <DirectorySelector 
                    setFiles={setFiles} 
                    setDirectoryPath={setDirectoryPath}
                />
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <button onClick={startNewChat} style={{ 
                        backgroundColor: '#007BFF',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 20px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        width: '80%',
                        transition: 'background-color 0.3s ease',
                        }}
                        onMouseEnter={(e) => (e.target.style.backgroundColor = '#0056b3')}
                        onMouseLeave={(e) => (e.target.style.backgroundColor = '#007BFF')}
                        >

                        Start New Chat
                    </button>
                </div>
                <Sidebar
                    files={files}
                    setFiles={setFiles}
                    selectedFiles={selectedFiles}
                    setSelectedFiles={setSelectedFiles}
                    setSessionId={setSessionId}
                    setDirectoryPath={setDirectoryPath}
                    directoryPath={directoryPath}

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
