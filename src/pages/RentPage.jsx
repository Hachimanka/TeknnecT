import React, { useState } from 'react';
import './RentPage.css';
import LogoPlaceholder from '../assets/wakwak.png';
import PostItemModal from '../components/PostItemModal';

function RentPage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [defaultItemType, setDefaultItemType] = useState('');
  const [showChatModal, setShowChatModal] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const rentals = [
    { title: 'Bike for Rent', description: 'Good for daily commutes.', image: LogoPlaceholder, user: 'Divan J.', profile: require('../assets/dj.jpg'), date: '2023-06-01' },
    { title: 'Bike for Rent', description: 'Good for daily commutes.', image: LogoPlaceholder, user: 'Divan J.', profile: require('../assets/dj.jpg'), date: '2023-06-01' },
    { title: 'Projector', description: 'Useful for events and presentations.', image: LogoPlaceholder, user: 'Mica H.', profile: require('../assets/dj.jpg'), date: '2023-06-05' },
    { title: 'Bike for Rent', description: 'Good for daily commutes.', image: LogoPlaceholder, user: 'Divan J.', profile: require('../assets/dj.jpg'), date: '2023-06-01' },
    { title: 'Projector', description: 'Useful for events and presentations.', image: LogoPlaceholder, user: 'Mica H.', profile: require('../assets/dj.jpg'), date: '2023-06-05' },
    { title: 'Projector', description: 'Useful for events and presentations.', image: LogoPlaceholder, user: 'Mica H.', profile: require('../assets/dj.jpg'), date: '2023-06-05' }
  ];

  const openPostModal = (type) => {
    setDefaultItemType(type.toLowerCase()); // Convert to lowercase to match PostItemModal logic
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
    <main className="rent-page">
      <h1 className="rent-page-title">Rentals</h1>
      <p className="rent-page-subtitle">Rent items or offer your own!</p>

      <div className="rent-action-buttons">
        <button className="rent-post-btn" onClick={() => openPostModal('rent')}>
          Offer for Rent
        </button>
      </div>

      <section className="rent-items-section">
        <div className="rent-header">
          <h2 className="rent-section-title">Available for Rent</h2>
          <input
            type="text"
            className="rent-search-bar"
            placeholder="Search rentals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="rent-items-grid">
          {rentals
            .filter(item =>
              item.title.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((item, index) => (
              <div
                key={index}
                className="rent-item-card"
                onClick={() => handleCardClick(item)}
              >
                <div className="rent-item-badge">For Rent</div>
                <div className="rent-item-image">
                  <img src={item.image} alt={item.title} />
                </div>
                <div className="rent-item-info">
                  <div>
                    <h3 className="rent-item-title">{item.title}</h3>
                    <p className="rent-item-description">{item.description}</p>
                    <p className="rent-item-date">Listed on: {new Date(item.date).toLocaleDateString()}</p>
                  </div>
                  <div className="rent-item-footer">
                    <div className="rent-item-user">
                      <img src={item.profile} alt="profile" className="rent-user-pic" />
                      <span>{item.user}</span>
                    </div>
                    <button className="rent-item-button">Inquire</button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>

      {selectedItem && (
        <div className="rent-modal-overlay" onClick={closeModal}>
          <div className="rent-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="rent-modal-close" onClick={closeModal}>×</button>
            <h2 className="rent-modal-title">{selectedItem.title}</h2>
            <img src={selectedItem.image} alt="item" className="rent-modal-image" />
            <p>{selectedItem.description}</p>
            <p><strong>Listed on:</strong> {new Date(selectedItem.date).toLocaleDateString()}</p>
            <p><strong>Listed by:</strong> {selectedItem.user}</p>
            <button className="rent-chat-button" onClick={() => setShowChatModal(true)}>
              Chat With Owner
            </button>
          </div>
        </div>
      )}

      {showPostModal && (
        <PostItemModal onClose={closePostModal} defaultType={defaultItemType} />
      )}

      {showChatModal && (
        <div className="rent-modal-overlay" onClick={() => setShowChatModal(false)}>
          <div className="rent-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="rent-modal-title">Chat With Owner</h2>
            <textarea
              className="rent-chat-textarea"
              placeholder="Write a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
            <div className="rent-chat-actions">
              <button className="rent-cancel-button" onClick={() => setShowChatModal(false)}>Cancel</button>
              <button className="rent-send-button" onClick={() => {
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

export default RentPage;