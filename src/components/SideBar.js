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

        if (item.type === 'folder') {
            const newSelectedFiles = [...selectedFiles];
            const handleSelection = (subItem, subPath = '') => {
                const subFullPath = `${subPath}${subItem.name}`;
                if (!newSelectedFiles.includes(subFullPath)) {
                    newSelectedFiles.push(subFullPath);
                }
                if (subItem.type === 'folder' && subItem.children) {
                    subItem.children.forEach((child) => handleSelection(child, `${subFullPath}/`));
                }
            };

            const folderSelected = item.children && item.children.every(child => selectedFiles.includes(`${fullPath}/${child.name}`));
            
            if (folderSelected) {
                const newSelectedFiles = selectedFiles.filter((file) => !file.startsWith(fullPath));
                setSelectedFiles(newSelectedFiles);
            } else {
                if (item.children) {
                    item.children.forEach((child) => handleSelection(child, `${fullPath}/`));
                }
                setSelectedFiles(newSelectedFiles);
            }
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
