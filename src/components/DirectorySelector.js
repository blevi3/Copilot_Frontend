import React, { useState } from 'react';
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

    return (
        <div>
            <button onClick={handleDirectorySelection}>Select Directory</button>
            {selectedDirectory && <p>Selected: {selectedDirectory}</p>}
        </div>
    );
};

export default DirectorySelector;
