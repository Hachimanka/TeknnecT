import React, { useState } from 'react';
import './LostFoundPage.css';
import LogoPlaceholder from '../assets/wakwak.png';
import PostItemModal from '../components/PostItemModal'; // 👈 import the modal

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function LostFoundPage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false); // 👈 state for modal
  const [showChatModal, setShowChatModal] = useState(false);
  const [message, setMessage] = useState('');

  const items = [
    { title: 'Calculator', description: '2nd Edition, Used Once', status: 'Lost', user: 'Divan J.', image: LogoPlaceholder, profile: require('../assets/dj.jpg'), dateLost: '2023-06-10' },
    { title: 'Calculator', description: '2nd Edition, Used Once', status: 'Lost', user: 'Divan J.', image: LogoPlaceholder, profile: require('../assets/dj.jpg'), dateLost: '2023-06-10' },
    { title: 'Calculator', description: '2nd Edition, Used Once', status: 'Lost', user: 'Divan J.', image: LogoPlaceholder, profile: require('../assets/dj.jpg'), dateLost: '2023-06-10' },
    { title: 'Calculator', description: '2nd Edition, Used Once', status: 'Lost', user: 'Divan J.', image: LogoPlaceholder, profile: require('../assets/dj.jpg'), dateLost: '2023-06-10' },
    { title: 'Black Wallet', description: 'Found near the library entrance on June 20.', status: 'Found', user: 'Mica H.', image: LogoPlaceholder, profile: require('../assets/dj.jpg'), dateFound: '2023-06-10' }
  ];

  const handleCardClick = (item) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  const openPostModal = () => {
    setShowPostModal(true);
  };

  const closePostModal = () => {
    setShowPostModal(false);
  };

  return (
    <main className="lost-found-page">
      <h1 className="page-title">Lost & Found</h1>
      <p className="page-subtitle">Have you lost or found an item? Post it here and help the community!</p>

      <div className="action-buttons">
        <button className="report-lost-btn" onClick={openPostModal}>Report Lost Item</button>
        <button className="report-found-btn" onClick={openPostModal}>Report Found Item</button>
      </div>

      <section className="items-section">
        <h2 className="section-title">Recent Posts</h2>
        <div className="items-grid">
          {items.map((item, index) => (
            <div
              key={index}
              className={`item-card ${item.status.toLowerCase()}`}
              onClick={() => handleCardClick(item)}
            >
              <div className={`item-badge ${item.status.toLowerCase()}`}>{item.status}</div>
              <div className="item-image">
                <img src={item.image} alt="placeholder" />
              </div>
              <div className={`item-info ${item.status.toLowerCase()}`}>
                <div>
                  <h3 className="item-title">{item.title}</h3>
                  <p className="item-description">{item.description}</p>
                      <p className="item-date">
                        {item.status === 'Lost' 
                          ? `Lost on: ${formatDate(item.dateLost)}` 
                          : `Found on: ${formatDate(item.dateFound)}`}
                      </p>
                </div>
                <div className="item-footer">
                  <div className="item-user">
                    <img src={item.profile} alt="profile" className="profile-pic" />
                    <span>{item.user}</span>
                  </div>
                  <button className="item-action-button">
                    {item.status === 'Lost' ? 'I Found It' : 'Claim Item'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* View Item Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <h2>{selectedItem.title}</h2>
            <img src={selectedItem.image} alt="Enlarged item" className="modal-image" />
            <p>{selectedItem.description}</p>
            <p><strong>Status:</strong> {selectedItem.status}</p>
            <p>
              <strong>
                {selectedItem.status === 'Lost' ? 'Lost on:' : 'Found on:'}
              </strong> {formatDate(selectedItem.status === 'Lost' ? selectedItem.dateLost : selectedItem.dateFound)}
            </p>
            <p><strong>Reported by:</strong> {selectedItem.user}</p>
            <button className="chat-button" onClick={() => setShowChatModal(true)}>
              Chat With Uploader
            </button>
          </div>
        </div>
      )}

      {/* Post Item Modal */}
      {showPostModal && <PostItemModal onClose={closePostModal} />}

      {/* Chat Modal */}
      {showChatModal && (
        <div className="modal-overlay" onClick={() => setShowChatModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Chat With Uploader</h2>
            <textarea
              className="chat-textarea"
              placeholder="Write a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
            <div className="chat-actions">
              <button className="cancel-button" onClick={() => setShowChatModal(false)}>Cancel</button>
              <button className="send-button" onClick={() => {
                console.log("Sent message:", message); // Replace with real send logic if needed
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

export default LostFoundPage;
