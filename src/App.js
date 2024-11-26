import React, { useState } from 'react';
import DirectorySelector from './components/DirectorySelector';
import Sidebar from './components/SideBar';
import Chat from './components/Chat';

const App = () => {
    const [files, setFiles] = useState([]); // Hierarchical file structure
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [directoryPath, setDirectoryPath] = useState('');  // State to store the selected directory path

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
                <Chat selectedFiles={selectedFiles} directoryPath={directoryPath} /> {/* Pass directoryPath to Chat */}
            </div>
        </div>
    );
};

export default App;
