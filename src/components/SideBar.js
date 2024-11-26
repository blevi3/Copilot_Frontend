import React, { useState } from 'react';

const Sidebar = ({ files, selectedFiles, setSelectedFiles }) => {
    const [expandedFolders, setExpandedFolders] = useState({});

    const toggleFolder = (folder) => {
        setExpandedFolders((prev) => ({
            ...prev,
            [folder]: !prev[folder],
        }));
    };

    const toggleFileSelection = (item, basePath = '') => {
        const fullPath = `${basePath}${item.name}`;

        // If it's a directory, select or deselect all of its files and subfolders (but not the folder itself)
        if (item.type === 'folder') {
            const newSelectedFiles = [...selectedFiles];
            const handleSelection = (subItem, subPath = '') => {
                const subFullPath = `${subPath}${subItem.name}`;
                if (!newSelectedFiles.includes(subFullPath)) {
                    newSelectedFiles.push(subFullPath); // Select if not already selected
                }
                if (subItem.type === 'folder' && subItem.children) {
                    // Recursively handle subfolders
                    subItem.children.forEach((child) => handleSelection(child, `${subFullPath}/`));
                }
            };

            // Check if the folder is already selected to toggle between select/deselect
            const folderSelected = item.children && item.children.every(child => selectedFiles.includes(`${fullPath}/${child.name}`));
            
            if (folderSelected) {
                // If all items under this folder are selected, deselect them
                const newSelectedFiles = selectedFiles.filter((file) => !file.startsWith(fullPath));
                setSelectedFiles(newSelectedFiles);
            } else {
                // Select all items under this folder (except the folder itself)
                if (item.children) {
                    item.children.forEach((child) => handleSelection(child, `${fullPath}/`));
                }
                setSelectedFiles(newSelectedFiles);
            }
        } else {
            // Toggle file selection as usual (files will be selected individually)
            setSelectedFiles((prev) =>
                prev.includes(fullPath)
                    ? prev.filter((file) => file !== fullPath) // Remove if already selected
                    : [...prev, fullPath] // Add if not selected
            );
        }
    };

    const renderFiles = (items, basePath = '') => {
        return (
            <ul>
                {items.map((item) => {
                    const fullPath = `${basePath}${item.name}`;
                    const isSelected = selectedFiles.includes(fullPath);

                    return (
                        <li key={fullPath}>
                            {item.type === 'folder' ? (
                                <>
                                    <span
                                        style={{ cursor: 'pointer', fontWeight: 'bold' }}
                                        onClick={() => toggleFolder(fullPath)}
                                    >
                                        {expandedFolders[fullPath] ? '📂' : '📁'} {item.name}
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleFileSelection(item, basePath)}
                                    />
                                    {expandedFolders[fullPath] &&
                                        renderFiles(item.children, `${fullPath}/`)}
                                </>
                            ) : (
                                <>
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleFileSelection(item, basePath)}
                                    />
                                    {item.name}
                                </>
                            )}
                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <div>
            <h3>Files</h3>
            {renderFiles(files)}
        </div>
    );
};

export default Sidebar;
