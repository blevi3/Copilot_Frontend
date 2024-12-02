import React, { useState, useEffect } from 'react';
import { getAllConversations, getChatHistory, selectDirectory } from '../api';

const Sidebar = ({ files, setFiles, selectedFiles, setSelectedFiles, setSessionId, setDirectoryPath }) => {
    const [expandedFolders, setExpandedFolders] = useState({});
    const [conversations, setConversations] = useState([]);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await getAllConversations();
                setConversations(response.data.conversations); // Includes session_id and chat_name
            } catch (error) {
                console.error("Failed to fetch conversations:", error);
            }
        };

        fetchConversations();
    }, []);

    const handleConversationSelect = async (sessionId) => {
        try {
            const response = await getChatHistory(sessionId);
            const history = response.data.history;

            if (history.length > 0) {
                const directoryPath = history[0].path; // Assume all entries in a session use the same path
                setDirectoryPath(directoryPath); // Update the directory path in state

                const directoryResponse = await selectDirectory(directoryPath); // Fetch directory structure
                if (directoryResponse.data.files) {
                    setFiles(directoryResponse.data.files); // Update the files state for the sidebar
                } else {
                    alert("Failed to load directory structure!");
                }
            }
            setSessionId(sessionId); // Update the selected session ID
        } catch (error) {
            console.error("Error loading conversation:", error);
        }
    };
    

    const excludedDirs = ['venv', 'virtualenv', 'node_modules', '__pycache__', 'migrations', '.git'];
    const excludedExtensions = ['jpg', 'png', 'gif', 'jpeg', 'sqlite3', 'woff', 'env', 'config', 'woff2', 'ttf', 'eot', 'svg', 'ico', 'mp4', 'webm', 'wav', 'mp3', 'pdf', 'zip', 'rar', 'tar', 'gz', '7z', 'exe', 'pkg', 'deb', 'dmg', 'iso', 'img'];

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
                                        {expandedFolders[fullPath] ? '-' : '+'} {item.name}
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
    
    const renderConversations = () => (
        <ul>
            {conversations
            .slice()
            .reverse()
            .map((conversation) => (
                <li
                    key={conversation.session_id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleConversationSelect(conversation.session_id)}
                >
                    {conversation.chat_name}
                </li>
            ))}
    </ul>
    
    );
    
    return (
        <>
            <div>
                <h3>Files</h3>
                {renderFiles(files)}
            </div>
            <div>
                <h3>Conversations</h3>
                {renderConversations()}

            </div>
        </>
    );
};

export default Sidebar;
