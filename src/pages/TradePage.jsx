import React, { useState, useEffect } from 'react';
import './TradePage.css';
import DefaultProfile from '../assets/logo.png';
import PostItemModal from '../components/PostItemModal';
import { auth, db } from '../firebase';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  setDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';

function formatDate(timestamp) {
  if (!timestamp || !timestamp.toDate) return 'Unknown date';
  const date = timestamp.toDate();
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function TradePage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [defaultTradeType, setDefaultTradeType] = useState('');
  const [showChatModal, setShowChatModal] = useState(false);
  const [message, setMessage] = useState('');
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [dateSort, setDateSort] = useState('Newest');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const q = query(
          collection(db, 'items'),
          where('type', '==', 'trade'),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const results = await Promise.all(querySnapshot.docs.map(async docSnap => {
          const data = docSnap.data();
          let userProfile = DefaultProfile;
          let userName = data.email;

          if (data.uid) {
            const userDoc = await getDoc(doc(db, 'users', data.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              if (userData.photoURL) userProfile = userData.photoURL;
              if (userData.name) userName = userData.name;
            }
          }

          return {
            id: docSnap.id,
            ...data,
            status: data.type.charAt(0).toUpperCase() + data.type.slice(1),
            user: userName,
            image: data.imageUrls?.[0] || '',
            profile: userProfile,
          };
        }));

        setItems(results);
      } catch (err) {
        console.error("Error fetching trade items:", err);
      }
    };

    fetchItems();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, category, dateSort]);

  const handleCardClick = (item) => setSelectedItem(item);
  const closeModal = () => setSelectedItem(null);
  const openPostModal = (tradeType) => {
    setDefaultTradeType(tradeType);
    setShowPostModal(true);
  };
  const closePostModal = () => {
    setShowPostModal(false);
    setDefaultTradeType('');
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedItem?.uid) return;

    const sender = auth.currentUser;
    const receiverId = selectedItem.uid;

    if (!sender || !receiverId) {
      alert('Cannot send message. You may not be logged in.');
      return;
    }

    const chatId = sender.uid < receiverId
      ? `${sender.uid}_${receiverId}`
      : `${receiverId}_${sender.uid}`;

    try {
      await setDoc(doc(db, 'chats', chatId), {
        users: [sender.uid, receiverId],
        lastMessage: message.trim(),
        lastMessageTime: serverTimestamp(),
        lastPostId: selectedItem.id,
        lastPostTitle: selectedItem.title,
        lastPostStatus: selectedItem.status
      }, { merge: true });

      const messageData = {
        sender: sender.uid,
        senderName: sender.displayName || sender.email,
        text: `[RE: ${selectedItem.status} - ${selectedItem.title}] ${message.trim()}`,
        timestamp: serverTimestamp(),
        read: false,
        postReference: {
          postId: selectedItem.id,
          postTitle: selectedItem.title,
          postStatus: selectedItem.status,
          postCategory: selectedItem.category || 'N/A',
          postLocation: selectedItem.location || 'N/A',
          postImage: selectedItem.image,
          postDescription: selectedItem.description,
          postOwner: selectedItem.user,
          postOwnerUid: selectedItem.uid,
          postCreatedAt: selectedItem.createdAt,
          postPrice: selectedItem.price || 'N/A'
        },
        messageType: 'trade_inquiry',
        messageContext: `Inquiry about ${selectedItem.status.toLowerCase()} item: ${selectedItem.title}`,
        originalMessage: message.trim()
      };

      await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);

      setShowChatModal(false);
      setMessage('');
      alert('Message sent successfully!');
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    }
  };

  const closeChatModal = () => {
    setShowChatModal(false);
    setMessage('');
  };

  const getTradeTypeLabel = (type) => {
    switch(type) {
      case 'trade': return 'For Trade';
      default: return type;
    }
  };

  const getActionText = (type) => {
    switch(type) {
      case 'trade': return 'Contact Trader';
      default: return 'Contact User';
    }
  };

  const filteredItems = items
    .filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        category === 'All' || (item.category && item.category === category);
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (dateSort === 'Newest') {
        return b.createdAt?.toDate() - a.createdAt?.toDate();
      } else {
        return a.createdAt?.toDate() - b.createdAt?.toDate();
      }
    });

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="PageWrapper page-fade-in">
      <main className="trade-page">
        <h1 className="trade-page-title">Trade Marketplace</h1>
        <p className="trade-page-subtitle">
          Trade items with the community!
        </p>

        <div className="trade-action-row">
          <div className="trade-action-buttons">
            <button
              className="trade-post-btn"
              onClick={() => openPostModal('Trade')}
            >
              Post Trade Offer
            </button>
          </div>

          <div className="trade-search-sort-controls">
            <input
              type="text"
              className="trade-searchbox"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="trade-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Books">Books</option>
              <option value="Clothing">Clothing</option>
              <option value="Other">Others</option>
            </select>
            <select
              className="trade-date-sort-select"
              value={dateSort}
              onChange={(e) => setDateSort(e.target.value)}
            >
              <option value="Newest">Newest to Oldest</option>
              <option value="Oldest">Oldest to Newest</option>
            </select>
          </div>
        </div>

        <section className="trade-items-section">
          <h2 className="trade-section-title">Recent Trade Posts</h2>
          {currentItems.length === 0 ? (
            <p className="trade-empty-message">
              No trade posts found. Try adjusting your search or filters.
            </p>
          ) : (
            <>
              <div className="trade-items-grid">
                {currentItems.map((item) => (
                  <div
                    key={item.id}
                    className={`trade-item-card ${item.status.toLowerCase()}`}
                    onClick={() => handleCardClick(item)}
                  >
                    <div className={`trade-item-badge ${item.status.toLowerCase()}`}>
                      {getTradeTypeLabel(item.status.toLowerCase())}
                    </div>
                    <div className="trade-item-image">
                      <img src={item.image} alt="item" />
                    </div>
                    <div className={`trade-item-info ${item.status.toLowerCase()}`}>
                      <div>
                        <h3 className="trade-item-title">{item.title}</h3>
                        <p className="trade-item-description">{item.description}</p>
                        {item.price && (
                          <p className="trade-item-price">₱{item.price}</p>
                        )}
                        <p className="trade-item-date">
                          Posted on: {formatDate(item.createdAt)}
                        </p>
                      </div>
                      <div className="trade-item-footer">
                        <div className="trade-item-user">
                          <img src={item.profile} alt="profile" className="trade-profile-pic" />
                          <span>{item.user}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="trade-pagination-controls">
                  <button onClick={handlePrevPage} disabled={currentPage === 1}>
                    « Prev
                  </button>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Next »
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {selectedItem && (
          <div className="trade-modal-overlay" onClick={closeModal}>
            <div className="trade-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="trade-modal-header">
                <button className="trade-modal-close" onClick={closeModal}>×</button>
                <h2 className="trade-modal-title">{selectedItem.title}</h2>
              </div>

              <div className="trade-modal-body">
                <img src={selectedItem.image} alt="item" className="trade-modal-image" />
                <div className="trade-modal-details">
                  <p className="trade-spacing"><strong>Description:</strong> {selectedItem.description}</p>
                  <p className="trade-spacing"><strong>Type:</strong> {getTradeTypeLabel(selectedItem.status.toLowerCase())}</p>
                  {selectedItem.price && (
                    <p className="trade-spacing"><strong>Price:</strong> ₱{selectedItem.price}</p>
                  )}
                  <p className="trade-spacing"><strong>Category:</strong> {selectedItem.category || 'N/A'}</p>
                  <p className="trade-spacing"><strong>Location:</strong> {selectedItem.location || 'N/A'}</p>
                  <p className="trade-spacing"><strong>Posted on:</strong> {formatDate(selectedItem.createdAt)}</p>
                  <p className="trade-spacing"><strong>Posted by:</strong> {selectedItem.user}</p>
                  {selectedItem.condition && (
                    <p className="trade-spacing"><strong>Condition:</strong> {selectedItem.condition}</p>
                  )}
                </div>
              </div>

              <div className="trade-modal-footer">
                <button className="trade-chat-button" onClick={() => setShowChatModal(true)}>
                  {getActionText(selectedItem.status.toLowerCase())}
                </button>
              </div>
            </div>
          </div>
        )}

        {showPostModal && <PostItemModal onClose={closePostModal} defaultType={defaultTradeType} />}

        {showChatModal && (
          <div className="trade-modal-overlay" onClick={closeChatModal}>
            <div className="trade-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="trade-modal-header">
                <button className="trade-modal-close" onClick={closeChatModal}>×</button>
                <h2 className="trade-modal-title">{getActionText(selectedItem?.status.toLowerCase())}</h2>
              </div>

              <div className="trade-modal-body">
                <div className="trade-post-reference-card">
                  <div className="trade-post-ref-header">
                    <span className={`trade-post-ref-badge ${selectedItem?.status.toLowerCase()}`}>
                      {getTradeTypeLabel(selectedItem?.status.toLowerCase())}
                    </span>
                    <h4 className="trade-post-ref-title">{selectedItem?.title}</h4>
                  </div>
                  <div className="trade-post-ref-details">
                    <div className="trade-post-ref-image">
                      <img src={selectedItem?.image} alt="item" />
                    </div>
                    <div className="trade-post-ref-info">
                      <p><strong>Category:</strong> {selectedItem?.category || 'N/A'}</p>
                      <p><strong>Location:</strong> {selectedItem?.location || 'N/A'}</p>
                      {selectedItem?.price && (
                        <p><strong>Price:</strong> ₱{selectedItem?.price}</p>
                      )}
                      <p><strong>Posted by:</strong> {selectedItem?.user}</p>
                    </div>
                  </div>
                </div>

                <div className="trade-chat-info">
                  <p>Send a message to <strong>{selectedItem?.user}</strong> about their {getTradeTypeLabel(selectedItem?.status.toLowerCase()).toLowerCase()}: <strong>{selectedItem?.title}</strong></p>
                </div>

                <textarea
                  className="trade-chat-textarea"
                  placeholder={`Write a message about "${selectedItem?.title}"...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                />
                <div className="trade-char-count">
                  {message.length}/500 characters
                </div>
              </div>

              <div className="trade-modal-footer">
                <div className="trade-chat-actions">
                  <button className="trade-cancel-button" onClick={closeChatModal}>Cancel</button>
                  <button 
                    className="trade-send-button" 
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                  >
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default TradePage;
