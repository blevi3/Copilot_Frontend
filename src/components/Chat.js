import React, { useState, useEffect, useRef } from 'react';
import { askQuestion, getChatHistory } from '../api';  // Import the new API call for history fetching
import './Chat.css';

const Chat = ({ selectedFiles, directoryPath, sessionId }) => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);  // State to store chat history
    const chatContainerRef = useRef(null);  // Ref to handle auto-scrolling

    // Fetch chat history whenever the sessionId changes
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await getChatHistory(sessionId);
                setHistory(response.data.history);  // Set history to the state
            } catch (error) {
                console.error('Error fetching chat history:', error);
            }
        };

        fetchHistory();
    }, [sessionId]);  // Re-fetch history if sessionId changes

    // Scroll to the bottom of the chat container whenever history or new messages change
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [history, answer]);  // Re-run on history or answer change

    const beautifyText = (text) => {
        // Convert markdown-like syntax to HTML-like formatting
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');  // Bold
        text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');  // Bold (alternative syntax)
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');  // Italic
        text = text.replace(/_(.*?)_/g, '<em>$1</em>');  // Italic (alternative syntax)
        text = text.replace(/`(.*?)`/g, '<code>$1</code>');  // Inline code
        text = text.replace(/\n/g, '<br />');
        return text;
    };

    const handleAskQuestion = async () => {
        setLoading(true);
        setError(null);  // Reset error state
        try {
            const response = await askQuestion(question, selectedFiles, directoryPath, sessionId);
            setAnswer(beautifyText(response.data.answer));  // Beautify the answer text

            // Update history state with new question and answer
            setHistory((prevHistory) => [
                ...prevHistory,
                { question, answer: beautifyText(response.data.answer) }
            ]);
            setQuestion(""); 
        } catch (error) {
            console.error('Error asking question:', error);
            setError('There was an issue asking the question. Please try again.');
        } finally {
            setLoading(false);  // Hide loading spinner after the request is complete
        }
    };

    return (
        <div className="chat-container">
            <h2 className="chat-header">Ask a question</h2>
            <p className="directory-path">Selected directory: {directoryPath}</p>

            <div className="history-container">
                <div className="history" ref={chatContainerRef}>
                    {history.length > 0 ? (
                        history.map((entry, index) => (
                            <div key={index} className="history-entry">
                                <p className="question"><strong>Q: </strong>{entry.question}</p>
                                <p className="answer"><strong>A: </strong><span dangerouslySetInnerHTML={{ __html: entry.answer }} /></p>
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
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask your question..."
                    className="question-input"
                    onKeyPress={(e) => e.key === 'Enter' && !loading && handleAskQuestion()}
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
