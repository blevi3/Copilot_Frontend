// App.js
import React, { useState, useEffect } from 'react';
import DirectorySelector from './components/DirectorySelector';
import Sidebar from './components/SideBar';
import Chat from './components/Chat';
import { v4 as uuidv4 } from 'uuid';

const App = () => {
    const [files, setFiles] = useState([]); // Hierarchical file structure
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [directoryPath, setDirectoryPath] = useState('');  // State to store the selected directory path
    const [sessionId, setSessionId] = useState('');

    useEffect(() => {
        // Check if a session ID exists in localStorage, otherwise create one
        let storedSessionId = localStorage.getItem('session_id');
        if (!storedSessionId) {
            storedSessionId = uuidv4();  // Generate a new session ID if not found
            localStorage.setItem('session_id', storedSessionId);  // Store it in localStorage
        }
        setSessionId(storedSessionId);  // Set the session ID
    }, []);

    return (
        <div style={{ display: 'flex' }}>
            <div style={{ width: '300px', borderRight: '1px solid #ccc', padding: '10px' }}>
                <DirectorySelector 
                    setFiles={setFiles} 
                    setDirectoryPath={setDirectoryPath}  // Pass the setter function for the path
                />
                <Sidebar
                    files={files}
                    selectedFiles={selectedFiles}
                    setSelectedFiles={setSelectedFiles}
                />
            </div>
            <div style={{ flex: 1, padding: '20px' }}>
                <Chat 
                    selectedFiles={selectedFiles} 
                    directoryPath={directoryPath} 
                    sessionId={sessionId}  // Pass the sessionId to the Chat component
                />
            </div>
        </div>
    );
};

export default App;
