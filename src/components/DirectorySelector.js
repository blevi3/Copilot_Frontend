import React, { useState } from 'react';
import { selectDirectory } from '../api';  // Import the API utility

const DirectorySelector = ({ setFiles, setDirectoryPath }) => {
    const [selectedDirectory, setSelectedDirectory] = useState('');

    const handleDirectorySelection = async () => {
        const directory = await window.electron.openDirectory();  // Open directory via Electron dialog
        setSelectedDirectory(directory);

        if (!directory) {
            alert('No directory selected!');
            return;
        }

        // Normalize the directory path (replace backslashes with forward slashes)
        const normalizedDirectory = directory.replace(/\\/g, '/');

        // Update the selected directory path in the parent component state
        setDirectoryPath(normalizedDirectory);

        try {
            // Send the directory path to the backend
            const response = await selectDirectory(normalizedDirectory);

            if (response.data.files) {
                setFiles(response.data.files);  // Assuming the backend returns a list of files/folders
            } else {
                alert('Failed to fetch files!');
            }
        } catch (error) {
            console.error('Failed to select directory:', error);
            alert('Failed to fetch files!');
        }
    };

    return (
        <div>
            <button onClick={handleDirectorySelection}>Select Directory</button>
            {selectedDirectory && <p>Selected: {selectedDirectory}</p>}
        </div>
    );
};

export default DirectorySelector;
