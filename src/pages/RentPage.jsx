import React, { useState, useEffect, useMemo } from 'react';
import './RentPage.css';
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

const ITEMS_PER_PAGE = 8;

function formatDate(timestamp) {
  if (!timestamp || !timestamp.toDate) return 'Unknown date';
  const date = timestamp.toDate();
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function RentPage() {
  // Modal and Form State
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [message, setMessage] = useState('');

  // Data and Loading State
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtering, Sorting, and Pagination State
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'oldest'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'items'),
          where('type', '==', 'rent'), // Query only for items "For Rent"
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
            status: 'For Rent',
            user: userName,
            image: data.imageUrls?.[0] || '',
            profile: userProfile,
          };
        }));

        setItems(results);
      } catch (err) {
        console.error("Error fetching rental items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const ALL_CATEGORIES = [
    "Electronics",
    "Books",
    "Clothing",
    "Other"
  ];

  const processedItems = useMemo(() => {
    let results = items;
    if (filterCategory !== 'all') { results = results.filter(item => item.category === filterCategory); }
    if (searchTerm.trim() !== '') { results = results.filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase())); }
    results = [...results].sort((a, b) => {
      const dateA = a.createdAt?.toDate?.();
      const dateB = b.createdAt?.toDate?.();
      
      // Handle cases where dates might be missing or invalid
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;  // Put items without date at the end
      if (!dateB) return -1; // Put items without date at the end
      
      return sortOrder === 'newest' ? 
        dateB.getTime() - dateA.getTime() : 
        dateA.getTime() - dateB.getTime();
    });
    return results;
  }, [items, filterCategory, searchTerm, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory, searchTerm, sortOrder]);

  const totalPages = Math.ceil(processedItems.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, processedItems]);

  const handleCardClick = (item) => setSelectedItem(item);
  const closeModal = () => setSelectedItem(null);
  const openPostModal = () => setShowPostModal(true);
  const closePostModal = () => setShowPostModal(false);

  const handleSendMessage = async () => {
    // Logic is identical to the original and does not need changes
    if (!message.trim() || !selectedItem?.uid) return;
    const sender = auth.currentUser; const receiverId = selectedItem.uid;
    if (!sender || !receiverId) { alert('Cannot send message. You may not be logged in.'); return; }
    const chatId = sender.uid < receiverId ? `${sender.uid}_${receiverId}` : `${receiverId}_${sender.uid}`;
    try {
        await setDoc(doc(db, 'chats', chatId), { users: [sender.uid, receiverId], lastMessage: `[RE: ${selectedItem.status} - ${selectedItem.title}] ${message.trim()}`, lastMessageTime: serverTimestamp(), lastPostId: selectedItem.id, lastPostTitle: selectedItem.title, lastPostStatus: selectedItem.status }, { merge: true });
        const messageData = {
            sender: sender.uid, senderName: sender.displayName || sender.email, text: `[RE: ${selectedItem.status} - ${selectedItem.title}] ${message.trim()}`, timestamp: serverTimestamp(), read: false,
            postReference: { postId: selectedItem.id, postTitle: selectedItem.title, postStatus: selectedItem.status, postCategory: selectedItem.category || 'N/A', postLocation: selectedItem.location || 'N/A', postImage: selectedItem.image, postDescription: selectedItem.description, postOwner: selectedItem.user, postOwnerUid: selectedItem.uid, postCreatedAt: selectedItem.createdAt, postPrice: selectedItem.price || 'N/A' },
            messageType: 'post_inquiry', messageContext: `Inquiry about ${selectedItem.status.toLowerCase()} item: ${selectedItem.title}`, originalMessage: message.trim()
        };
        await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);
        setShowChatModal(false); setMessage(''); alert('Message sent successfully!');
    } catch (err) { console.error('Error sending message:', err); alert('Failed to send message. Please try again.'); }
  };

  const closeChatModal = () => {
    setShowChatModal(false);
    setMessage('');
  };

  return (
    <div className="rent-PageWrapper">
      <main className="rent-page-container">
        <h1 className="rent-page-title">Rental Marketplace</h1>
        <p className="rent-page-subtitle">Find items to rent or offer your own items for rental!</p>

        <div className="rent-action-buttons">
          <button className="rent-offer-rent-btn" onClick={openPostModal}>Offer for Rent</button>
        </div>
        
        <div className="rent-controls-bar">
            <input 
                type="text"
                placeholder="Search items..."
                className="rent-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select className="rent-select-dropdown" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="all">All Categories</option>
                {ALL_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>
            <select className="rent-select-dropdown" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
            </select>
        </div>

        <section className="rent-items-section">
          <h2 className="rent-section-title">Rental Listings</h2>
          {loading ? (
            <p className="rent-loading-message">Loading listings...</p>
          ) : paginatedItems.length === 0 ? (
            <p className="rent-empty-message">No rental listings found.</p>
          ) : (
            <>
            <div className="rent-items-grid">
              {paginatedItems.map((item) => (
                <div key={item.id} className="rent-item-card" onClick={() => handleCardClick(item)}>
                  <div className="rent-item-badge">{item.status}</div>
                  <div className="rent-item-image">
                    <img src={item.image} alt="item" />
                  </div>
                  <div className="rent-item-info">
                    <div>
                      <h3 className="rent-item-title">{item.title}</h3>
                      <p className="rent-item-description">{item.description}</p>
                      {item.price && <p className="rent-item-price">₱{item.price}/day</p>}
                      <p className="rent-item-date">Posted on: {formatDate(item.createdAt)}</p>
                    </div>
                    <div className="rent-item-footer">
                      <div className="rent-item-user">
                        <img src={item.profile} alt="profile" className="rent-profile-pic" />
                        <span>{item.user}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
             {totalPages > 1 && (
                <div className="rent-pagination">
                    <button onClick={() => setCurrentPage(prev => prev - 1)} disabled={currentPage === 1}>« Previous</button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage === totalPages}>Next »</button>
                </div>
            )}
            </>
          )}
        </section>
        
        {/* --- Modals --- */}
        {selectedItem && (
          <div className="rent-modal-overlay" onClick={closeModal}>
            <div className="rent-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="rent-modal-header">
                <button className="rent-modal-close" onClick={closeModal}>×</button>
                <h2 className="rent-modal-title">{selectedItem.title}</h2>
              </div>
              <div className="rent-modal-body">
                <img src={selectedItem.image} alt="item" className="rent-modal-image" />
                <div className="rent-modal-details">
                  <p><strong>Description:</strong> {selectedItem.description}</p>
                  <p><strong>Status:</strong> {selectedItem.status}</p>  
                  <p><strong>Category:</strong> {selectedItem.category || 'N/A'}</p>
                  <p><strong>Location:</strong> {selectedItem.location || 'N/A'}</p>
                  {selectedItem.price && <p><strong>Price:</strong> ₱{selectedItem.price}/day</p>}
                  <p><strong>Posted on:</strong> {formatDate(selectedItem.createdAt)}</p>
                  <p><strong>Posted by:</strong> {selectedItem.user}</p>
                </div>
              </div>
              <div className="rent-modal-footer">
                <button className="rent-chat-button" onClick={() => setShowChatModal(true)}>Chat With Owner</button>
              </div>
            </div>
          </div>
        )}

        {showPostModal && <PostItemModal onClose={closePostModal} defaultType="rent" />}

        {showChatModal && (
          <div className="rent-modal-overlay" onClick={() => setShowChatModal(false)}>
            <div className="rent-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="rent-modal-header">
                <button className="rent-modal-close" onClick={closeChatModal}>×</button>
                <h2 className="rent-modal-title">Chat With Owner</h2>
              </div>
              <div className="rent-modal-body">
                <div className="rent-post-reference-card">
                  <div className="rent-post-ref-header">
                    <span className="rent-post-ref-badge">{selectedItem?.status}</span>
                    <h4 className="rent-post-ref-title">{selectedItem?.title}</h4>
                  </div>
                  <div className="rent-post-ref-details">
                    <div className="rent-post-ref-image"><img src={selectedItem?.image} alt="item" /></div>
                    <div className="rent-post-ref-info">
                      <p><strong>Category:</strong> {selectedItem?.category || 'N/A'}</p>
                      <p><strong>Location:</strong> {selectedItem?.location || 'N/A'}</p>
                      {selectedItem?.price && <p><strong>Price:</strong> ₱{selectedItem.price}/day</p>}
                      <p><strong>Posted by:</strong> {selectedItem?.user}</p>
                    </div>
                  </div>
                </div>
                <div className="rent-chat-info">
                  <p>Send a message to <strong>{selectedItem?.user}</strong> about their rental listing: <strong>{selectedItem?.title}</strong></p>
                </div>
                <textarea
                  className="rent-chat-textarea"
                  placeholder={`Write a message...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                />
                <div className="rent-char-count">{message.length}/500</div>
              </div>
              <div className="rent-modal-footer">
                <div className="rent-chat-actions">
                  <button className="rent-cancel-button" onClick={closeChatModal}>Cancel</button>
                  <button className="rent-send-button" onClick={handleSendMessage} disabled={!message.trim()}>Send Message</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default RentPage;
