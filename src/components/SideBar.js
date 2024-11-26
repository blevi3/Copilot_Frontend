import React, { useState } from 'react';

const Sidebar = ({ files, selectedFiles, setSelectedFiles }) => {
    const [expandedFolders, setExpandedFolders] = useState({});

    const excludedDirs = ['venv', 'virtualenv', 'node_modules', '__pycache__'];
    const excludedExtensions = ['jpg', 'png', 'gif', 'jpeg', 'sqlite3', 'woff'];

    const isExcluded = (item) => {
        if (item.type === 'folder') {
            return excludedDirs.includes(item.name);
        }
        if (item.type === 'file') {
            const extension = item.name.split('.').pop().toLowerCase();
            return excludedExtensions.includes(extension);
        }
        return false;
    };

    const toggleFolder = (folder) => {
        setExpandedFolders((prev) => ({
            ...prev,
            [folder]: !prev[folder],
        }));
    };

    const toggleFileSelection = (item, basePath = '') => {
        const fullPath = `${basePath}${item.name}`;
        if (isExcluded(item)) return; 

        if (item.type === 'folder') {
            const newSelectedFiles = new Set(selectedFiles);

            const handleSelection = (subItem, subPath = '') => {
                const subFullPath = `${subPath}${subItem.name}`;
                if (isExcluded(subItem)) return;

                if (subItem.type === 'file') {
                    if (newSelectedFiles.has(subFullPath)) {
                        newSelectedFiles.delete(subFullPath);
                    } else {
                        newSelectedFiles.add(subFullPath);
                    }
                }
                if (subItem.type === 'folder' && subItem.children) {
                    subItem.children.forEach((child) => handleSelection(child, `${subFullPath}/`));
                }
            };

            const folderSelected = item.children && item.children.every(
                (child) => child.type === 'file' && selectedFiles.includes(`${fullPath}/${child.name}`)
            );

            if (folderSelected) {
                item.children.forEach((child) => handleSelection(child, `${fullPath}/`));
            } else {
                item.children.forEach((child) => handleSelection(child, `${fullPath}/`));
            }

            setSelectedFiles(Array.from(newSelectedFiles));
        } else {
            setSelectedFiles((prev) =>
                prev.includes(fullPath)
                    ? prev.filter((file) => file !== fullPath)
                    : [...prev, fullPath]
            );
        }
    };

    const renderFiles = (items, basePath = '') => {
        return (
            <ul>
                {items.map((item) => {
                    if (isExcluded(item)) return null;

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
