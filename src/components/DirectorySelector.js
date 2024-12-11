import React, { useState, useEffect } from 'react';
import { selectDirectory } from '../api';

const DirectorySelector = ({ setFiles, setDirectoryPath }) => {
    const [selectedDirectory, setSelectedDirectory] = useState('');

    const handleDirectorySelection = async () => {
        const directory = await window.electron.openDirectory();
        setSelectedDirectory(directory);

        if (!directory) {
            alert('No directory selected!');
            return;
        }

        const normalizedDirectory = directory.replace(/\\/g, '/');

        setDirectoryPath(normalizedDirectory);

        try {
            const response = await selectDirectory(normalizedDirectory);

            if (response.data.files) {
                setFiles(response.data.files);
            } else {
                alert('Failed to fetch files!');
            }
        } catch (error) {
            console.error('Failed to select directory:', error);
            alert('Failed to fetch files!');
        }
    };

    useEffect(() => {
        if (selectedDirectory) {
            const fetchFiles = async () => {
                const normalizedDirectory = selectedDirectory.replace(/\\/g, '/');
                try {
                    const response = await selectDirectory(normalizedDirectory);
                    if (response.data.files) {
                        setFiles(response.data.files); // Refresh files after the directory is selected
                    } else {
                        alert('Failed to fetch files!');
                    }
                } catch (error) {
                    console.error('Error fetching updated files:', error);
                }
            };
            fetchFiles();
        }
    }, [selectedDirectory, setFiles]);

    return (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <button
                onClick={handleDirectorySelection}
                style={{
                    backgroundColor: '#007BFF',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 20px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease',
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#0056b3')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = '#007BFF')}
            >
                Select Directory
            </button>
        </div>
    );
};

export default DirectorySelector;
