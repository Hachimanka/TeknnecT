import React, { useState, useEffect } from 'react';
import './DonationsPage.css';
import DefaultProfile from '../assets/logo.png';
import DonationsPostModal from '../components/DonationsPostModal';
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

function DonationsPage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [defaultItemType, setDefaultItemType] = useState('');
  const [showChatModal, setShowChatModal] = useState(false);
  const [message, setMessage] = useState('');
  const [items, setItems] = useState([]);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const q = query(
          collection(db, 'items'),
          where('type', 'in', ['donation', 'request']),
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
            status: data.type === 'donation' ? 'Available' : 'Needed',
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

  const filteredItems = items.filter(item => {
    if (filterType === 'all') return true;
    if (filterType === 'available') return item.type === 'donation';
    if (filterType === 'needed') return item.type === 'request';
    return true;
  });

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

    const sender = auth.currentUser ;
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
          postCreatedAt: selectedItem.createdAt,
          postType: selectedItem.type
        },
        
        // Message type to distinguish regular messages from post-related messages
        messageType: 'post_inquiry',
        
        // Additional context
        messageContext: `Inquiry about ${selectedItem.status.toLowerCase()} donation: ${selectedItem.title}`,
        
        // Original message without prefix (for display flexibility)
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

  return (
    <div className="PageWrapper page-fade-in">
      <main className="donations-page">
        <h1 className="page-title">Donations</h1>
        <p className="page-subtitle">Share resources with the community or find what you need!</p>

        <div className="action-buttons">
          <button className="donate-btn" onClick={() => openPostModal('Donation')}>
            Donate Item
          </button>
          <button className="request-btn" onClick={() => openPostModal('Request')}>
            Request Item
          </button>
        </div>

        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All Items
          </button>
          <button 
            className={`filter-btn ${filterType === 'available' ? 'active' : ''}`}
            onClick={() => setFilterType('available')}
          >
            Available
          </button>
          <button 
            className={`filter-btn ${filterType === 'needed' ? 'active' : ''}`}
            onClick={() => setFilterType('needed')}
          >
            Needed
          </button>
        </div>

        <section className="items-section">
          <h2 className="section-title">
            {filterType === 'all' ? 'All Donations' : 
             filterType === 'available' ? 'Available Items' : 'Requested Items'}
          </h2>
          {filteredItems.length === 0 ? (
            <p className="empty-message">No items found.</p>
          ) : (
            <div className="items-grid">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`item-card ${item.type}`}
                  onClick={() => handleCardClick(item)}
                >
                  <div className={`item-badge ${item.type}`}>
                    {item.status}
                  </div>
                  <div className="item-image">
                    <img src={item.image} alt="item" />
                  </div>
                  <div className={`item-info ${item.type}`}>
                    <div>
                      <h3 className="item-title">{item.title}</h3>
                      <p className="item-description">{item.description}</p>
                      <p className="item-date">
                        {item.type === 'donation'
                          ? `Available since: ${formatDate(item.createdAt)}`
                          : `Requested on: ${formatDate(item.createdAt)}`}
                      </p>
                      {item.quantity && (
                        <p className="item-quantity">
                          <strong>Quantity:</strong> {item.quantity}
                        </p>
                      )}
                      {item.condition && (
                        <p className="item-condition">
                          <strong>Condition:</strong> {item.condition}
                        </p>
                      )}
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
                  {selectedItem.quantity && (
                    <p className="spacing"><strong>Quantity:</strong> {selectedItem.quantity}</p>
                  )}
                  {selectedItem.condition && (
                    <p className="spacing"><strong>Condition:</strong> {selectedItem.condition}</p>
                  )}
                  {selectedItem.urgency && (
                    <p className="spacing"><strong>Urgency:</strong> {selectedItem.urgency}</p>
                  )}
                  <p className="spacing">
                    <strong>{selectedItem.type === 'donation' ? 'Available since:' : 'Requested on:'}</strong> {formatDate(selectedItem.createdAt)}
                  </p>
                  <p className="spacing">
                    <strong>{selectedItem.type === 'donation' ? 'Donated by:' : 'Requested by:'}</strong> {selectedItem.user}
                  </p>
                </div>
              </div>

              {/* Footer Section */}
              <div className="modal-footer">
                <button className="chat-button" onClick={() => setShowChatModal(true)}>
                  {selectedItem.type === 'donation' ? 'Contact Donor' : 'Contact Requester'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Post Item Modal */}
        {showPostModal && <DonationsPostModal onClose={closePostModal} defaultType={defaultItemType} />}

        {/* Chat Modal */}
        {showChatModal && (
          <div className="modal-overlay" onClick={() => setShowChatModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              {/* Header Section */}
              <div className="modal-header">
                <button className="modal-close" onClick={closeChatModal}>×</button>
                <h2 className="modal-title">
                  {selectedItem?.type === 'donation' ? 'Contact Donor' : 'Contact Requester'}
                </h2>
              </div>

              {/* Body Section */}
              <div className="modal-body">
                {/* Enhanced Post Reference Card */}
                <div className="post-reference-card">
                  <div className="post-ref-header">
                    <span className={`post-ref-badge ${selectedItem?.type}`}>
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
                      {selectedItem?.quantity && (
                        <p><strong>Quantity:</strong> {selectedItem.quantity}</p>
                      )}
                      <p><strong>Posted by:</strong> {selectedItem?.user}</p>
                    </div>
                  </div>
                </div>

                <div className="chat-info">
                  <p>
                    Send a message to <strong>{selectedItem?.user}</strong> about their{' '}
                    {selectedItem?.type === 'donation' ? 'donation' : 'request'}: <strong>{selectedItem?.title}</strong>
                  </p>
                </div>
                
                <textarea
                  className="chat-textarea"
                  placeholder={`Write a message about the ${selectedItem?.type === 'donation' ? 'donation' : 'request'} "${selectedItem?.title}"...`}
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

export default DonationsPage;
