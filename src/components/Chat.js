import React, { useState, useEffect, useRef } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { askQuestion, getChatHistory } from '../api';
import { selectDirectory } from '../api';
import './Chat.css';

const Chat = ({ selectedFiles, directoryPath, sessionId, setFiles }) => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    const chatContainerRef = useRef(null);
    const questionInputRef = useRef(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!sessionId) return;
            try {
                const response = await getChatHistory(sessionId);
                setHistory(Array.isArray(response.data.history) ? response.data.history : []);
            } catch (error) {
                console.error('Error fetching chat history:', error);
            }
        };

        fetchHistory();
    }, [sessionId]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [history, answer]);

    const copyToClipboard = (code, setCopied) => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset button to "Copy" after 2 seconds
        });
    };

    const renderAnswer = (text) => {
        if (!text) return null;
        
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        const parts = [];
        let lastIndex = 0;
        let match;
    
        while ((match = codeBlockRegex.exec(text)) !== null) {
            const [fullMatch, language, code] = match;
            const index = match.index;
    
            if (lastIndex < index) {
                parts.push(
                    <span key={`text-${lastIndex}`}>{text.slice(lastIndex, index)}</span>
                );
            }
    
            parts.push(
                <div key={`code-${index}`} style={{ position: 'relative' }}>
                    <SyntaxHighlighter
                        language={language || 'plaintext'}
                        style={dracula}
                        customStyle={{
                            backgroundColor: '#2d2d2d',
                            color: '#ffffff',
                            borderRadius: '8px',
                            padding: '10px',
                        }}
                    >
                        {code.trim()}
                    </SyntaxHighlighter>
                    <button
                        onClick={() => copyToClipboard(code.trim(), setCopied)}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            backgroundColor: '#444',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            padding: '5px 10px',
                            cursor: 'pointer',
                        }}
                    >
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                </div>
            );
    
            lastIndex = index + fullMatch.length;
        }
    
        if (lastIndex < text.length) {
            parts.push(
                <span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>
            );
        }
    
        return parts;
    };

    const handleAskQuestion = async () => {
        if (!question.trim()) return; // Avoid submitting empty questions
        setLoading(true);
        setError(null);
        try {
            const response = await askQuestion(question, selectedFiles, directoryPath, sessionId);
            const formattedAnswer = response.data.answer;
            setAnswer(formattedAnswer);

            setHistory((prevHistory) => [
                ...prevHistory,
                { question, answer: formattedAnswer }
            ]);

            const updatedFilesResponse = await selectDirectory(directoryPath);
            if (updatedFilesResponse.data.files) {
                setFiles(updatedFilesResponse.data.files); // Refresh the file list
            }
            setQuestion('');
        } catch (error) {
            console.error('Error asking question:', error);
            setError('There was an issue asking the question. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setQuestion(e.target.value);

        // Dynamically adjust height of the textarea
        const textarea = questionInputRef.current;
        if (textarea) {
            textarea.style.height = 'auto'; // Reset height to calculate the new height
            textarea.style.height = `${Math.min(textarea.scrollHeight, 96)}px`; // Max height for 4 lines
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!loading) handleAskQuestion();
        }
    };

    return (
        <div className="chat-container" style={{ flex: 1 }}>
            <h2 className="chat-header">Ask a question</h2>
            <p className="directory-path">Selected directory: {directoryPath}</p>

            <div className="history-container">
                <div className="history" ref={chatContainerRef}>
                    {history.length > 0 ? (
                        history.map((entry, index) => (
                            <div key={index} className="history-entry">
                                <p className="question"><strong>Q: </strong>{entry.question}</p>
                                <p className="answer">
                                    <strong>A: </strong>{renderAnswer(entry.answer)}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="no-history">No history available.</p>
                    )}
                    {loading && (
                        <div className="loading-indicator">
                            <span>...</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="input-container">
                <textarea
                    ref={questionInputRef}
                    value={question}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask your question..."
                    className="question-input"
                    style={{
                        width: '100%',
                        resize: 'none',
                        overflow: 'auto', // Allow scroll for long queries
                        fontSize: '16px',
                        padding: '10px',
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                        outline: 'none',
                        lineHeight: '1.5',
                        maxHeight: '96px', // Limit height to 4 lines
                    }}
                />
                <button onClick={handleAskQuestion} className="ask-button" disabled={loading}>
                    {loading ? 'Asking...' : 'Ask'}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}
        </div>
    );
};
export default Chat;
