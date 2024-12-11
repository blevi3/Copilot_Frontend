import React, { useState, useEffect, useRef } from 'react';
import { getAllConversations, getChatHistory, selectDirectory, getModifiedFiles, revertFile } from '../api';

const Sidebar = ({ files, setFiles, selectedFiles, setSelectedFiles, setSessionId, setDirectoryPath, directoryPath }) => {
    const [expandedFolders, setExpandedFolders] = useState({});
    const [conversations, setConversations] = useState([]);
    const [modifiedFiles, setModifiedFiles] = useState([]);
    const [showModifiedFiles, setShowModifiedFiles] = useState(true);
    const [showConversations, setShowConversations] = useState(true);

    const directoryPathRef = useRef(directoryPath);

    // Update the ref whenever directoryPath changes
    useEffect(() => {
        directoryPathRef.current = directoryPath;
    }, [directoryPath]);

    const fetchModifiedFiles = async () => {
        try {
            console.log("fetch", directoryPathRef.current);
            const response = await getModifiedFiles(directoryPathRef.current);
            setModifiedFiles(response.data);
        } catch (error) {
            console.error("Failed to fetch modified files:", error);
        }
    };

    useEffect(() => {
        let pollingInterval;

        const startPolling = () => {
            fetchModifiedFiles(); // Fetch initially
            pollingInterval = setInterval(fetchModifiedFiles, 5000); // Poll every 5 seconds
        };

        const stopPolling = () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }
        };

        startPolling();

        return () => stopPolling(); // Cleanup on unmount
    }, []);

    const revert = async (filePath) => {
        try {
            await revertFile(filePath);
            setModifiedFiles(modifiedFiles.filter(file => file.file_path !== filePath));
            alert("File reverted successfully!");
        } catch (error) {
            console.error("Failed to revert file:", error);
            alert("Failed to revert file!");
        }
    };

    const renderModifiedFiles = () => (
        <ul style={{ listStyleType: 'none', paddingLeft: '10px' }}>
            {modifiedFiles.map(file => (
                <li key={file.file_path} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', overflow: 'hidden' }}>
                    <span
                        title={file.file_path}
                        style={{
                            flex: 1,
                            marginRight: '10px',
                            whiteSpace: 'normal',  // Allow text to wrap
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            wordBreak: 'break-word',  // Ensure long words break
                            paddingRight: '10px',  // Add padding for spacing
                        }}
                    >
                        {file.file_path}
                    </span>
                    <button
                        style={{
                            backgroundColor: '#444',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '3px',
                            padding: '5px',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s',
                        }}
                        onClick={() => revert(file.file_path)}
                    >
                        Revert
                    </button>
                </li>
            ))}
        </ul>
    );
    

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
            console.log("directoryPath", history[0].path);
            setDirectoryPath(history[0].path);
            if (history.length > 0) {
                const directoryPath = history[0].path; // Assume all entries in a session use the same path
                setDirectoryPath(history[0].path); // Update the directory path in state

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
            <ul style={{ listStyleType: 'none', paddingLeft: '10px' }}>
                {items.map((item) => {
                    if (isExcluded(item)) return null;

                    const fullPath = `${basePath}${item.name}`;
                    const isSelected = selectedFiles.includes(fullPath);

                    return (
                        <li key={fullPath} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.type === 'folder' ? (
                                <>
                                    <span
                                        style={{ cursor: 'pointer', fontWeight: 'bold', color: '#ddd' }}
                                        onClick={() => toggleFolder(fullPath)}
                                    >
                                        {expandedFolders[fullPath] ? '-' : '+'} {item.name}
                                    </span>
                                    <input
                                        type="checkbox"
                                        style={{ marginLeft: '5px' }}
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
                                        style={{ marginRight: '5px' }}
                                        checked={isSelected}
                                        onChange={() => toggleFileSelection(item, basePath)}
                                    />
                                    <span title={item.name}>{item.name}</span>
                                </>
                            )}
                        </li>
                    );
                })}
            </ul>
        );
    };

    const renderConversations = () => (
        <ul style={{ listStyleType: 'none', paddingLeft: '10px', overflow: 'auto', maxHeight: '300px' }}>
            {conversations
            .slice()
            .reverse()
            .map((conversation) => (
                <li
                    key={conversation.session_id}
                    style={{ cursor: 'pointer', color: '#ccc', padding: '5px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    onClick={() => handleConversationSelect(conversation.session_id)}
                >
                    {conversation.chat_name}
                </li>
            ))}
        </ul>
    );

    return (
        <div style={{ backgroundColor: '#333', color: '#fff', padding: '15px', overflow: 'hidden', height: '100%', width: '300px', borderRight: '1px solid #444' }}>
            <div>
                <h3>Files</h3>
                {renderFiles(files)}
            </div>
            <h3 onClick={() => setShowModifiedFiles(prev => !prev)} style={{ cursor: 'pointer', marginTop: '20px' }}>
                {showModifiedFiles ? 'Hide' : 'Show'} Modified Files
            </h3>
            {showModifiedFiles && renderModifiedFiles()}

            <h3 onClick={() => setShowConversations(prev => !prev)} style={{ cursor: 'pointer', marginTop: '20px' }}>
                {showConversations ? 'Hide' : 'Show'} Conversations
            </h3>
            {showConversations && renderConversations()}
        </div>
    );
};

export default Sidebar;
