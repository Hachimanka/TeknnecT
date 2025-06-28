import React, { useState } from 'react';
import './TradePage.css';
import LogoPlaceholder from '../assets/wakwak.png';
import PostItemModal from '../components/PostItemModal';

function TradePage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [defaultItemType, setDefaultItemType] = useState('');
  const [showChatModal, setShowChatModal] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const trades = [
    { title: 'Textbooks for Trade', description: 'College textbooks in good condition.', image: LogoPlaceholder, user: 'Divan J.', profile: require('../assets/dj.jpg'), date: '2023-06-01' },
    { title: 'Textbooks for Trade', description: 'College textbooks in good condition.', image: LogoPlaceholder, user: 'Divan J.', profile: require('../assets/dj.jpg'), date: '2023-06-01' },
    { title: 'Textbooks for Trade', description: 'College textbooks in good condition.', image: LogoPlaceholder, user: 'Divan J.', profile: require('../assets/dj.jpg'), date: '2023-06-01' },
    { title: 'Textbooks for Trade', description: 'College textbooks in good condition.', image: LogoPlaceholder, user: 'Divan J.', profile: require('../assets/dj.jpg'), date: '2023-06-01' },
    { title: 'Textbooks for Trade', description: 'College textbooks in good condition.', image: LogoPlaceholder, user: 'Divan J.', profile: require('../assets/dj.jpg'), date: '2023-06-01' },
    { title: 'Textbooks for Trade', description: 'College textbooks in good condition.', image: LogoPlaceholder, user: 'Divan J.', profile: require('../assets/dj.jpg'), date: '2023-06-01' },
    { title: 'Calculator', description: 'Scientific calculator in working condition.', image: LogoPlaceholder, user: 'Mica H.', profile: require('../assets/dj.jpg'), date: '2023-06-05' }
  ];

  const openPostModal = (type) => {
    setDefaultItemType(type);
    setShowPostModal(true);
  };

  const closePostModal = () => {
    setShowPostModal(false);
    setDefaultItemType('');
  };

  const handleCardClick = (item) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  return (
    <main className="trade-page">
      <h1 className="trade-page-title">Trade</h1>
      <p className="trade-page-subtitle">Trade your items with other students!</p>

      <div className="trade-action-buttons">
        <button className="trade-post-btn" onClick={() => openPostModal('Trade')}>
          Trade Item
        </button>
      </div>

      <section className="trade-items-section">
        <div className="trade-header">
          <h2 className="trade-section-title">Available Trades</h2>
          <input
            type="text"
            className="trade-search-bar"
            placeholder="Search trades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="trade-items-grid">
          {trades
            .filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((item, index) => (
              <div key={index} className="trade-item-card" onClick={() => handleCardClick(item)}>
                <div className="trade-item-badge">Trade</div>
                <div className="trade-item-image">
                  <img src={item.image} alt={item.title} />
                </div>
                <div className="trade-item-info">
                  <div>
                    <h3 className="trade-item-title">{item.title}</h3>
                    <p className="trade-item-description">{item.description}</p>
                    <p className="trade-item-date">Posted on: {new Date(item.date).toLocaleDateString()}</p>
                  </div>
                  <div className="trade-item-footer">
                    <div className="trade-item-user">
                      <img src={item.profile} alt="profile" className="trade-user-pic" />
                      <span>{item.user}</span>
                    </div>
                    <button className="trade-item-button">Trade</button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>

      {selectedItem && (
        <div className="trade-modal-overlay" onClick={closeModal}>
          <div className="trade-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="trade-modal-close" onClick={closeModal}>×</button>
            <h2 className="trade-modal-title">{selectedItem.title}</h2>
            <img src={selectedItem.image} alt="item" className="trade-modal-image" />
            <p>{selectedItem.description}</p>
            <p><strong>Posted on:</strong> {new Date(selectedItem.date).toLocaleDateString()}</p>
            <p><strong>Posted by:</strong> {selectedItem.user}</p>
            <button className="trade-chat-button" onClick={() => setShowChatModal(true)}>
              Chat With Owner
            </button>
          </div>
        </div>
      )}

      {showPostModal && (
        <PostItemModal onClose={closePostModal} defaultType={defaultItemType} />
      )}

      {showChatModal && (
        <div className="trade-modal-overlay" onClick={() => setShowChatModal(false)}>
          <div className="trade-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="trade-modal-title">Chat With Owner</h2>
            <textarea
              className="trade-chat-textarea"
              placeholder="Write a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
            <div className="trade-chat-actions">
              <button className="trade-cancel-button" onClick={() => setShowChatModal(false)}>Cancel</button>
              <button className="trade-send-button" onClick={() => {
                console.log("Sent message:", message);
                setShowChatModal(false);
                setMessage('');
              }}>Send</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default TradePage;
