import React, { useState, useEffect } from 'react';
import './LostFoundPage.css';
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

function LostFoundPage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [defaultItemType, setDefaultItemType] = useState('');
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
          where('type', 'in', ['lost', 'found']),
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
        console.error("Error fetching items:", err);
      }
    };

    fetchItems();
  }, []);

  const handleCardClick = (item) => setSelectedItem(item);
  const closeModal = () => setSelectedItem(null);
  const openPostModal = (itemType) => {
    setDefaultItemType(itemType);
    setShowPostModal(true);
  };
  const closePostModal = () => {
    setShowPostModal(false);
    setDefaultItemType('');
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
      // Create/update chat document
      await setDoc(doc(db, 'chats', chatId), {
        users: [sender.uid, receiverId],
        lastMessage: message.trim(),
        lastMessageTime: serverTimestamp(),
        lastPostId: selectedItem.id,
        lastPostTitle: selectedItem.title,
        lastPostStatus: selectedItem.status
      }, { merge: true });

      // Add the message with enhanced post identification
      const messageData = {
        sender: sender.uid,
        senderName: sender.displayName || sender.email,
        text: `[RE: ${selectedItem.status} - ${selectedItem.title}] ${message.trim()}`,
        timestamp: serverTimestamp(),
        read: false,
        
        // Enhanced post identification
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
          postCreatedAt: selectedItem.createdAt
        },
        
        // Message type to distinguish regular messages from post-related messages
        messageType: 'post_inquiry',
        
        // Additional context
        messageContext: `Inquiry about ${selectedItem.status.toLowerCase()} item: ${selectedItem.title}`,
        
        // Original message without prefix (for display flexibility)
        originalMessage: message.trim()
      };

      console.log('Sending message with data:', messageData);
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

  const filteredItems = items
  .filter(item => {
    // Search filter
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    // Category filter
    const matchesCategory = category === 'All' || (item.category && item.category === category);
    return matchesSearch && matchesCategory;
  })
  .sort((a, b) => {
    if (dateSort === 'Newest') {
      return b.createdAt?.toDate() - a.createdAt?.toDate();
    } else {
      return a.createdAt?.toDate() - b.createdAt?.toDate();
    }
  });

  return (
    <div className="PageWrapper page-fade-in">
      <main className="Diana-tryi">
        <h1 className="page-title">Lost & Found</h1>
        <p className="page-subtitle">Have you lost or found an item? Post it here and help the community!</p>

        <div className="action-buttons">
          <button className="report-lost-btn" onClick={() => openPostModal('Lost')}>Report Lost Item</button>
          <button className="report-found-btn" onClick={() => openPostModal('Found')}>Report Found Item</button>
          <div className="search-sort-controls">
            <input
              type="text"
              className="searchbox"
              placeholder="Search items..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <select
              className="category-select"
              value={category}
              onChange={e => setCategory(e.target.value)}
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
              onChange={e => setDateSort(e.target.value)}
            >
              <option value="Newest">Newest to Oldest</option>
              <option value="Oldest">Oldest to Newest</option>
            </select>
          </div>
        </div>

        <section className="items-section">
          <h2 className="section-title">Recent Posts</h2>
          {filteredItems.length === 0 ? (
              <p className="empty-message">No posts found.</p>
            ) : (
              <div className="items-grid">
                {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`item-card ${item.status.toLowerCase()}`}
                  onClick={() => handleCardClick(item)}
                >
                  <div className={`item-badge ${item.status.toLowerCase()}`}>{item.status}</div>
                  <div className="item-image">
                    <img src={item.image} alt="item" />
                  </div>
                  <div className={`item-info ${item.status.toLowerCase()}`}>
                    <div>
                      <h3 className="item-title">{item.title}</h3>
                      <p className="item-description">{item.description}</p>
                      <p className="item-date">
                        {item.status === 'Lost'
                          ? `Lost on: ${formatDate(item.createdAt)}`
                          : `Found on: ${formatDate(item.createdAt)}`}
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

        {/* Main Item Modal */}
        {selectedItem && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              {/* Header Section */}
              <div className="modal-header">
                <button className="modal-close" onClick={closeModal}>×</button>
                <h2 className="modal-title">{selectedItem.title}</h2>
              </div>

              {/* Body Section - Scrollable */}
              <div className="modal-body">
                <img src={selectedItem.image} alt="item" className="modal-image" />
                
                <div className="modal-details">
                  <p className="spacing"><strong>Description:</strong> {selectedItem.description}</p>
                  <p className="spacing"><strong>Status:</strong> {selectedItem.status}</p>  
                  <p className="spacing"><strong>Category:</strong> {selectedItem.category || 'N/A'}</p>
                  <p className="spacing"><strong>Location:</strong> {selectedItem.location || 'N/A'}</p>
                  <p className="spacing"><strong>{selectedItem.status === 'Lost' ? 'Lost on:' : 'Found on:'}</strong> {formatDate(selectedItem.createdAt)}</p>
                  <p className="spacing"><strong>Reported by:</strong> {selectedItem.user}</p>
                </div>
              </div>

              {/* Footer Section */}
              <div className="modal-footer">
                <button className="chat-button" onClick={() => setShowChatModal(true)}>
                  Chat With Uploader
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Post Item Modal */}
        {showPostModal && <PostItemModal onClose={closePostModal} defaultType={defaultItemType} />}

        {/* Chat Modal */}
        {showChatModal && (
          <div className="modal-overlay" onClick={() => setShowChatModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              {/* Header Section */}
              <div className="modal-header">
                <button className="modal-close" onClick={closeChatModal}>×</button>
                <h2 className="modal-title">Chat With Uploader</h2>
              </div>

              {/* Body Section */}
              <div className="modal-body">
                {/* Enhanced Post Reference Card */}
                <div className="post-reference-card">
                  <div className="post-ref-header">
                    <span className={`post-ref-badge ${selectedItem?.status.toLowerCase()}`}>
                      {selectedItem?.status}
                    </span>
                    <h4 className="post-ref-title">{selectedItem?.title}</h4>
                  </div>
                  <div className="post-ref-details">
                    <div className="post-ref-image">
                      <img src={selectedItem?.image} alt="item" />
                    </div>
                    <div className="post-ref-info">
                      <p><strong>Category:</strong> {selectedItem?.category || 'N/A'}</p>
                      <p><strong>Location:</strong> {selectedItem?.location || 'N/A'}</p>
                      <p><strong>Posted by:</strong> {selectedItem?.user}</p>
                    </div>
                  </div>
                </div>

                <div className="chat-info">
                  <p>Send a message to <strong>{selectedItem?.user}</strong> about their {selectedItem?.status.toLowerCase()} item: <strong>{selectedItem?.title}</strong></p>
                </div>
                
                <textarea
                  className="chat-textarea"
                  placeholder={`Write a message about the ${selectedItem?.status.toLowerCase()} item "${selectedItem?.title}"...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                />
                <div className="char-count">
                  {message.length}/500 characters
                </div>
              </div>

              {/* Footer Section */}
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

export default LostFoundPage;