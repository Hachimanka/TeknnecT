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
  const [showChatModal, setShowChatModal] = useState(false);
  const [message, setMessage] = useState('');
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [dateSort, setDateSort] = useState('Newest');

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
            status: 'Trade', // Standardized to match Lost/Found
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

  const handleCardClick = (item) => setSelectedItem(item);
  const closeModal = () => setSelectedItem(null);
  const openPostModal = () => setShowPostModal(true);
  const closePostModal = () => setShowPostModal(false);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedItem?.uid) return;

    const sender = auth.currentUser;
    const receiverId = selectedItem.uid;

    if (!sender || !receiverId) {
      alert('Cannot send message. You may not be logged in.');
      return;
    }

    if (sender.uid === receiverId) {
      alert('You cannot message yourself.');
      return;
    }

    const chatId = sender.uid < receiverId
      ? `${sender.uid}_${receiverId}`
      : `${receiverId}_${sender.uid}`;

    try {
      // Create/update chat document
      await setDoc(doc(db, 'chats', chatId), {
        users: [sender.uid, receiverId],
        lastMessage: `[RE: Trade - ${selectedItem.title}] ${message.trim()}`,
        lastMessageTime: serverTimestamp(),
        lastPostId: selectedItem.id,
        lastPostTitle: selectedItem.title,
        lastPostStatus: 'Trade',
        lastPostType: 'trade'
      }, { merge: true });

      // Add message with post reference (identical to LostFound structure)
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        sender: sender.uid,
        senderName: sender.displayName || sender.email,
        text: `[RE: Trade - ${selectedItem.title}] ${message.trim()}`,
        timestamp: serverTimestamp(),
        read: false,
        postReference: {
          postType: 'trade',
          postId: selectedItem.id,
          postTitle: selectedItem.title,
          postStatus: 'Trade',
          postCategory: selectedItem.category || 'N/A',
          postLocation: selectedItem.location || 'N/A',
          postImage: selectedItem.image,
          postDescription: selectedItem.description,
          postOwner: selectedItem.user,
          postOwnerUid: selectedItem.uid,
          postCreatedAt: selectedItem.createdAt,
          postPrice: selectedItem.price || 'N/A',
          postCondition: selectedItem.condition || 'N/A'
        },
        messageType: 'post_inquiry', // Must match LostFound
        messageContext: `Inquiry about trade item: ${selectedItem.title}`,
        originalMessage: message.trim()
      });

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

  const filteredItems = items
    .filter(item => {
      return (item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
              item.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
             (category === 'All' || item.category === category);
    })
    .sort((a, b) => {
      return dateSort === 'Newest' ? 
        b.createdAt?.toDate() - a.createdAt?.toDate() : 
        a.createdAt?.toDate() - b.createdAt?.toDate();
    });

  return (
    <div className="PageWrapper page-fade-in">
      <main className="trade-page">
        <h1 className="page-title">Trade Marketplace</h1>
        <p className="page-subtitle">Trade items with the community!</p>

        <div className="action-buttons">
          <button className="post-trade-btn" onClick={openPostModal}>Post Trade Offer</button>
          <div className="search-sort-controls">
            <input 
              type="text" 
              className="searchbox"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className="category-select"
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
              className="date-sort-select"
              value={dateSort}
              onChange={(e) => setDateSort(e.target.value)}
            >
              <option value="Newest">Newest to Oldest</option>
              <option value="Oldest">Oldest to Newest</option>
            </select>
          </div>
        </div>

        <section className="items-section">
          <h2 className="section-title">Recent Trade Posts</h2>
          {filteredItems.length === 0 ? (
            <p className="empty-message">No trade posts found.</p>
          ) : (
            <div className="items-grid">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`item-card ${item.status.toLowerCase()}`}
                  onClick={() => handleCardClick(item)}
                >
                  <div className={`item-badge ${item.status.toLowerCase()}`}>
                    For Trade
                  </div>
                  <div className="item-image">
                    <img src={item.image} alt={item.title} />
                  </div>
                  <div className={`item-info ${item.status.toLowerCase()}`}>
                    <div>
                      <h3 className="item-title">{item.title}</h3>
                      <p className="item-description">{item.description}</p>
                      {item.price && (
                        <p className="item-price">₱{item.price}</p>
                      )}
                      <p className="item-date">
                        Posted on: {formatDate(item.createdAt)}
                      </p>
                    </div>
                    <div className="item-footer">
                      <div className="item-user">
                        <img src={item.profile} alt="profile" className="profile-pic" />
                        <span>{item.user}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {selectedItem && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <button className="modal-close" onClick={closeModal}>×</button>
                <h2 className="modal-title">{selectedItem.title}</h2>
              </div>
              <div className="modal-body">
                <img src={selectedItem.image} alt={selectedItem.title} className="modal-image" />
                <div className="modal-details">
                  <p className="spacing"><strong>Description:</strong> {selectedItem.description}</p>
                  <p className="spacing"><strong>Type:</strong> For Trade</p>
                  {selectedItem.price && (
                    <p className="spacing"><strong>Price:</strong> ₱{selectedItem.price}</p>
                  )}
                  <p className="spacing"><strong>Category:</strong> {selectedItem.category || 'N/A'}</p>
                  <p className="spacing"><strong>Location:</strong> {selectedItem.location || 'N/A'}</p>
                  {selectedItem.condition && (
                    <p className="spacing"><strong>Condition:</strong> {selectedItem.condition}</p>
                  )}
                  <p className="spacing"><strong>Posted on:</strong> {formatDate(selectedItem.createdAt)}</p>
                  <p className="spacing"><strong>Posted by:</strong> {selectedItem.user}</p>
                </div>
              </div>
              <div className="modal-footer">
                <button className="chat-button" onClick={() => setShowChatModal(true)}>
                  Contact Trader
                </button>
              </div>
            </div>
          </div>
        )}

        {showPostModal && <PostItemModal onClose={closePostModal} defaultType="trade" />}

        {showChatModal && selectedItem && (
          <div className="modal-overlay" onClick={closeChatModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <button className="modal-close" onClick={closeChatModal}>×</button>
                <h2 className="modal-title">Contact Trader</h2>
              </div>
              <div className="modal-body">
                <div className="post-reference-card">
                  <div className="post-ref-header">
                    <span className="post-ref-badge trade">
                      For Trade
                    </span>
                    <h4 className="post-ref-title">{selectedItem.title}</h4>
                  </div>
                  <div className="post-ref-details">
                    <div className="post-ref-image">
                      <img src={selectedItem.image} alt={selectedItem.title} />
                    </div>
                    <div className="post-ref-info">
                      <p><strong>Category:</strong> {selectedItem.category || 'N/A'}</p>
                      <p><strong>Location:</strong> {selectedItem.location || 'N/A'}</p>
                      {selectedItem.price && (
                        <p><strong>Price:</strong> ₱{selectedItem.price}</p>
                      )}
                      <p><strong>Posted by:</strong> {selectedItem.user}</p>
                    </div>
                  </div>
                </div>
                
                <div className="chat-info">
                  <p>Send a message to <strong>{selectedItem.user}</strong> about their trade item: 
                  <strong> {selectedItem.title}</strong></p>
                </div>
                
                <textarea
                  className="chat-textarea"
                  placeholder={`Write a message about "${selectedItem.title}"...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                />
                <div className="char-count">
                  {message.length}/500 characters
                </div>
              </div>
              <div className="modal-footer">
                <div className="chat-actions">
                  <button className="cancel-button" onClick={closeChatModal}>Cancel</button>
                  <button
                    className="send-button"
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
