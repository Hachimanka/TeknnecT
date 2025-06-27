import React, { useState } from 'react';
import '../components/Chatbox.css';
import { FaArrowLeft } from 'react-icons/fa';
import Profile1 from '../assets/dj.jpg';


const dummyMessages = [
  { id: 1, name: 'Leonardi Di Vanci', lastMsg: 'Asa ako lubi', time: '1min', unread: true },
  { id: 2, name: 'Leonardo Di Lini', lastMsg: 'Psst Pogi', time: '1min', unread: false },
  { id: 3, name: 'Leonarda Di Nami', lastMsg: 'Hoyyy', time: '1min', unread: true }
];

const ChatBox = () => {
  const [activeChat, setActiveChat] = useState(null);
  const [filterMode, setFilterMode] = useState('all');

  return (
    <div className="chatbox-container">
      {!activeChat ? (
        <div className="messages-pane">
          <h2>Messages</h2>
          <div className="search-bar">
            <input type="text" placeholder="Search" />
          </div>
            <div className="filter-buttons">
            <button
                className="all"
                onClick={() => setFilterMode('all')}
                style={{ background: filterMode === 'all' ? '#f5c000' : '#fff', color: filterMode === 'all' ? '#fff' : '#a80000', border: filterMode === 'all' ? 'none' : '1px solid #a80000' }}
            >
                All
            </button>
            <button
                className="unread"
                onClick={() => setFilterMode('unread')}
                style={{ background: filterMode === 'unread' ? '#f5c000' : '#fff', color: filterMode === 'unread' ? '#fff' : '#a80000', border: filterMode === 'unread' ? 'none' : '1px solid #a80000' }}
            >
                Unread
            </button>
            </div>
          <div className="message-list">
            {dummyMessages
            .filter((msg) => filterMode === 'all' || msg.unread)
            .map((msg) => (
              <div key={msg.id} className="message-preview" onClick={() => setActiveChat(msg)}>
                <img src={Profile1} alt="profile" />
                    <div>
                    <strong style={{ fontWeight: msg.unread ? 'bold' : 'normal', color: '#a80000' }}>
                        {msg.name}
                    </strong>
                    <p style={{ margin: 0, fontWeight: msg.unread ? 'bold' : 'normal', color: '#a80000' }}>
                        {msg.lastMsg}
                    </p>
                    </div>
                <span>{msg.time}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="chat-pane">
          <div className="chat-header">
            <FaArrowLeft onClick={() => setActiveChat(null)} />
            <img src={Profile1} alt="profile" />
            <strong>{activeChat.name}</strong>
          </div>
            <div className="chat-messages">
            {/* Left Message (other user) */}
            <div className="chat-message-row left">
                <img className="chat-avatar" src={Profile1} alt="sender" />
                <div className="message left">
                Hoyyy
                <span>1min</span>
                </div>
            </div>

            {/* Right Message (you) */}
            <div className="chat-message-row right">
                <div className="message right">
                Ohhhh
                <span>1min</span>
                </div>
                <img className="chat-avatar" src={Profile1} alt="you" />
            </div>
            </div>
          <div className="chat-input">
            <input type="text" placeholder="Type a message..." />
            <button>{'>'}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
