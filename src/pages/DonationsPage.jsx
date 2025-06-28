import React, { useState } from 'react';
import './DonationsPage.css';
import LogoPlaceholder from '../assets/wakwak.png';
import PostItemModal from '../components/PostItemModal';

function DonationsPage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [defaultItemType, setDefaultItemType] = useState('');
  const [showChatModal, setShowChatModal] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const donations = [
    { title: 'School Supplies', description: 'Notebooks, pens, papers great for students in need.', image: LogoPlaceholder, user: 'Divan J.', profile: require('../assets/dj.jpg'), date: '2023-06-01' },
    { title: 'Used Clothes', description: 'Clean and wearable clothes for all ages.', image: LogoPlaceholder, user: 'Mica H.', profile: require('../assets/dj.jpg'), date: '2023-06-05' },
    { title: 'Used Clothes', description: 'Clean and wearable clothes for all ages.', image: LogoPlaceholder, user: 'Mica H.', profile: require('../assets/dj.jpg'), date: '2023-06-05' },
    { title: 'Used Clothes', description: 'Clean and wearable clothes for all ages.', image: LogoPlaceholder, user: 'Mica H.', profile: require('../assets/dj.jpg'), date: '2023-06-05' },
    { title: 'Used Clothes', description: 'Clean and wearable clothes for all ages.', image: LogoPlaceholder, user: 'Mica H.', profile: require('../assets/dj.jpg'), date: '2023-06-05' },
    { title: 'Used Clothes', description: 'Clean and wearable clothes for all ages.', image: LogoPlaceholder, user: 'Mica H.', profile: require('../assets/dj.jpg'), date: '2023-06-05' }
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
    <main className="donation-page">
      <h1 className="donation-page-title">Donations</h1>
      <p className="donation-page-subtitle">Donate items or see what’s available for donation!</p>

      <div className="donation-action-buttons">
        <button className="donation-post-btn" onClick={() => openPostModal('Donation')}>
          Donate Item
        </button>
      </div>

      <section className="donation-items-section">
        <div className="donation-header">
          <h2 className="donation-section-title">Available Donations</h2>
          <input
            type="text"
            className="donation-search-bar"
            placeholder="Search donations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="donation-items-grid">
          {donations
            .filter(item =>
              item.title.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((item, index) => (
              <div
                key={index}
                className="donation-item-card"
                onClick={() => handleCardClick(item)}
              >
                <div className="donation-item-badge">Donation</div>
                <div className="donation-item-image">
                  <img src={item.image} alt={item.title} />
                </div>
                <div className="donation-item-info">
                  <div>
                    <h3 className="donation-item-title">{item.title}</h3>
                    <p className="donation-item-description">{item.description}</p>
                    <p className="donation-item-date">Donated on: {new Date(item.date).toLocaleDateString()}</p>
                  </div>
                  <div className="donation-item-footer">
                    <div className="donation-item-user">
                      <img src={item.profile} alt="profile" className="donation-user-pic" />
                      <span>{item.user}</span>
                    </div>
                    <button className="donation-item-button">Claim</button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>

      {selectedItem && (
        <div className="donation-modal-overlay" onClick={closeModal}>
          <div className="donation-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="donation-modal-close" onClick={closeModal}>×</button>
            <h2 className="donation-modal-title">{selectedItem.title}</h2>
            <img src={selectedItem.image} alt="item" className="donation-modal-image" />
            <p>{selectedItem.description}</p>
            <p><strong>Donated on:</strong> {new Date(selectedItem.date).toLocaleDateString()}</p>
            <p><strong>Donated by:</strong> {selectedItem.user}</p>
            <button className="donation-chat-button" onClick={() => setShowChatModal(true)}>
              Chat With Donor
            </button>
          </div>
        </div>
      )}

      {showPostModal && (
        <PostItemModal onClose={closePostModal} defaultType={defaultItemType} />
      )}

      {showChatModal && (
        <div className="donation-modal-overlay" onClick={() => setShowChatModal(false)}>
          <div className="donation-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="donation-modal-title">Chat With Donor</h2>
            <textarea
              className="donation-chat-textarea"
              placeholder="Write a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
            <div className="donation-chat-actions">
              <button className="donation-cancel-button" onClick={() => setShowChatModal(false)}>Cancel</button>
              <button className="donation-send-button" onClick={() => {
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

export default DonationsPage;
