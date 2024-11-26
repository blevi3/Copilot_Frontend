import React, { useState } from 'react';
import { askQuestion } from '../api';
import './Chat.css'; // Assuming you will add the CSS for styles

const Chat = ({ selectedFiles, directoryPath }) => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAskQuestion = async () => {
        setLoading(true);  // Show loading spinner
        setError(null);  // Reset error state
        try {
            // You can use directoryPath here as needed, for example in the request body
            const response = await askQuestion(question, selectedFiles, directoryPath);
            setAnswer(response.data.answer);
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

            <div className="input-container">
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask your question..."
                    className="question-input"
                />
                <button onClick={handleAskQuestion} className="ask-button" disabled={loading}>
                    {loading ? 'Asking...' : 'Ask'}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {answer && <div className="answer-container"><strong>Answer: </strong>{answer}</div>}
        </div>
    );
};

export default Chat;
