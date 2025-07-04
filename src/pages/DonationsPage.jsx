import React, { useState, useEffect, useMemo } from 'react';
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

function DonationsPage({ darkMode }) {
  // State for Modals and Data
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [defaultItemType, setDefaultItemType] = useState('');
  const [showChatModal, setShowChatModal] = useState(false);
  const [message, setMessage] = useState('');
  
  // State for Data and Loading
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for Filtering, Sorting, and Pagination
  const [filterType, setFilterType] = useState('all'); // 'all', 'available', 'needed'
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'oldest'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Scroll position storage for modal prevention
  const [scrollPosition, setScrollPosition] = useState(0);

  // Modal scroll prevention functions
  const preventModalScroll = () => {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    setScrollPosition(currentScroll);
    document.body.classList.add('donations-modal-open');
    document.body.style.top = `-${currentScroll}px`;
  };

  const allowModalScroll = () => {
    document.body.classList.remove('donations-modal-open');
    document.body.style.top = '';
    window.scrollTo(0, scrollPosition);
  };

  // Effect to handle modal states and scroll prevention
  useEffect(() => {
    const hasOpenModal = selectedItem || showPostModal || showChatModal;
    
    if (hasOpenModal) {
      preventModalScroll();
    } else {
      allowModalScroll();
    }

    // Cleanup on unmount
    return () => {
      if (hasOpenModal) {
        allowModalScroll();
      }
    };
  }, [selectedItem, showPostModal, showChatModal]);

  // Handle escape key to close modals
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (showChatModal) {
          closeChatModal();
        } else if (selectedItem) {
          closeModal();
        } else if (showPostModal) {
          closePostModal();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showChatModal, selectedItem, showPostModal]);
  
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'items'),
          where('type', 'in', ['donation', 'request']),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const results = await Promise.all(querySnapshot.docs.map(async docSnap => {
          const data = docSnap.data();
          
          // Skip items that are marked as completed
          if (data.completed === true) {
            return null;
          }
          
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

        // Filter out null values (completed items)
        const filteredResults = results.filter(item => item !== null);
        setItems(filteredResults);
      } catch (err) {
        console.error("Error fetching items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Memoized derivation of unique categories for the filter dropdown
  const ALL_CATEGORIES = [
    "Electronics",
    "Books",
    "Clothing",
    "Other"
  ];

  // Memoized processing for filtering and sorting
  const processedItems = useMemo(() => {
    let results = items;

    // Filter by type (Available/Needed)
    if (filterType !== 'all') {
      const typeToFilter = filterType === 'available' ? 'donation' : 'request';
      results = results.filter(item => item.type === typeToFilter);
    }
    
    // Filter by category
    if (filterCategory !== 'all') {
        results = results.filter(item => item.category === filterCategory);
    }

    // Filter by search term
    if (searchTerm.trim() !== '') {
        results = results.filter(item => 
            item.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    // Sort
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
  }, [items, filterType, filterCategory, searchTerm, sortOrder]);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, filterCategory, searchTerm, sortOrder]);
  
  // Memoized pagination
  const totalPages = Math.ceil(processedItems.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, processedItems]);

  const handleCardClick = (item) => setSelectedItem(item);
  
  const closeModal = () => {
    setSelectedItem(null);
  };
  
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
    const chatId = sender.uid < receiverId ? `${sender.uid}_${receiverId}` : `${receiverId}_${sender.uid}`;
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
        sender: sender.uid, senderName: sender.displayName || sender.email, text: `[RE: ${selectedItem.status} - ${selectedItem.title}] ${message.trim()}`, timestamp: serverTimestamp(), read: false,
        postReference: { postId: selectedItem.id, postTitle: selectedItem.title, postStatus: selectedItem.status, postCategory: selectedItem.category || 'N/A', postLocation: selectedItem.location || 'N/A', postImage: selectedItem.image, postDescription: selectedItem.description, postOwner: selectedItem.user, postOwnerUid: selectedItem.uid, postCreatedAt: selectedItem.createdAt, postType: selectedItem.type },
        messageType: 'post_inquiry', messageContext: `Inquiry about ${selectedItem.status.toLowerCase()} donation: ${selectedItem.title}`, originalMessage: message.trim()
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

  const handleModalOverlayClick = (e, closeFunction) => {
    if (e.target === e.currentTarget) {
      closeFunction();
    }
  };
  
  return (
    <div className={`donations-PageWrapper ${darkMode ? 'dark-mode' : ''}`}>
      <main className="donations-page-container">
        <h1 className="donations-page-title">Donations</h1>
        <p className="donations-page-subtitle">Share resources with the community or find what you need!</p>

        <div className="donations-action-buttons">
          <button className="donations-donate-btn" onClick={() => openPostModal('Donation')}>
            Donate Item
          </button>
          <button className="donations-request-btn" onClick={() => openPostModal('Request')}>
            Request Item
          </button>
        </div>
        
        {/* -- RESTRUCTURED CONTROLS BAR -- */}
        <div className="donations-controls-bar">
            <input 
                type="text"
                placeholder="Search items..."
                className="donations-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select className="donations-select-dropdown" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">All Types</option>
                <option value="available">Available</option>
                <option value="needed">Needed</option>
            </select>
            <select className="donations-select-dropdown" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="all">All Categories</option>
                {ALL_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>
            <select className="donations-select-dropdown" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
            </select>
        </div>

        <section className="donations-items-section">
          <h2 className="donations-section-title">Community Listings</h2>
          {loading ? (
            <p className="donations-loading-message">Loading items...</p>
          ) : paginatedItems.length === 0 ? (
            <p className="donations-empty-message">No items match your criteria.</p>
          ) : (
            <>
              <div className="donations-items-grid">
                {paginatedItems.map((item) => (
                  <div key={item.id} className={`donations-item-card ${item.type}`} onClick={() => handleCardClick(item)}>
                    <div className={`donations-item-badge ${item.type}`}>{item.status}</div>
                    <div className="donations-item-image"><img src={item.image} alt="item" /></div>
                    <div className={`donations-item-info ${item.type}`}>
                      <div>
                        <h3 className="donations-item-title">{item.title}</h3>
                        <p className="donations-item-description">{item.description}</p>
                        <p className="donations-item-date">
                          {item.type === 'donation' ? `Available since: ${formatDate(item.createdAt)}` : `Requested on: ${formatDate(item.createdAt)}`}
                        </p>
                        {item.quantity && <p className="donations-item-quantity"><strong>Quantity:</strong> {item.quantity}</p>}
                        {item.condition && <p className="donations-item-condition"><strong>Condition:</strong> {item.condition}</p>}
                      </div>
                      <div className="donations-item-footer">
                        <div className="donations-item-user">
                          <img src={item.profile} alt="profile" className="donations-profile-pic" />
                          <span>{item.user}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {totalPages > 1 && (
                  <div className="donations-pagination">
                      <button onClick={() => setCurrentPage(prev => prev - 1)} disabled={currentPage === 1}>« Previous</button>
                      <span>Page {currentPage} of {totalPages}</span>
                      <button onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage === totalPages}>Next »</button>
                  </div>
              )}
            </>
          )}
        </section>

        {/* Main Item Modal */}
        {selectedItem && (
          <div 
            className="donations-modal-overlay" 
            onClick={(e) => handleModalOverlayClick(e, closeModal)}
          >
            <div className="donations-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="donations-modal-header">
                <button className="donations-modal-close" onClick={closeModal}>×</button>
                <h2 className="donations-modal-title">{selectedItem.title}</h2>
              </div>
              <div className="donations-modal-body">
                <img src={selectedItem.image} alt="item" className="donations-modal-image" />
                <div className="donations-modal-details">
                  <p><strong>Description:</strong> {selectedItem.description}</p>
                  <p><strong>Status:</strong> {selectedItem.status}</p>  
                  <p><strong>Category:</strong> {selectedItem.category || 'N/A'}</p>
                  <p><strong>Location:</strong> {selectedItem.location || 'N/A'}</p>
                  {selectedItem.quantity && <p><strong>Quantity:</strong> {selectedItem.quantity}</p>}
                  {selectedItem.condition && <p><strong>Condition:</strong> {selectedItem.condition}</p>}
                  {selectedItem.urgency && <p><strong>Urgency:</strong> {selectedItem.urgency}</p>}
                  <p><strong>{selectedItem.type === 'donation' ? 'Available since:' : 'Requested on:'}</strong> {formatDate(selectedItem.createdAt)}</p>
                  <p><strong>{selectedItem.type === 'donation' ? 'Donated by:' : 'Requested by:'}</strong> {selectedItem.user}</p>
                </div>
              </div>
              <div className="donations-modal-footer">
                <button className="donations-chat-button" onClick={() => setShowChatModal(true)}>
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
          <div 
            className="donations-modal-overlay" 
            onClick={(e) => handleModalOverlayClick(e, closeChatModal)}
          >
            <div className="donations-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="donations-modal-header">
                <button className="donations-modal-close" onClick={closeChatModal}>×</button>
                <h2 className="donations-modal-title">{selectedItem?.type === 'donation' ? 'Contact Donor' : 'Contact Requester'}</h2>
              </div>
              <div className="donations-modal-body">
                <div className="donations-post-reference-card">
                  <div className="donations-post-ref-header">
                    <span className={`donations-post-ref-badge ${selectedItem?.type}`}>{selectedItem?.status}</span>
                    <h4 className="donations-post-ref-title">{selectedItem?.title}</h4>
                  </div>
                  <div className="donations-post-ref-details">
                    <div className="donations-post-ref-image"><img src={selectedItem?.image} alt="item" /></div>
                    <div className="donations-post-ref-info">
                      <p><strong>Category:</strong> {selectedItem?.category || 'N/A'}</p>
                      <p><strong>Location:</strong> {selectedItem?.location || 'N/A'}</p>
                      {selectedItem?.quantity && <p><strong>Quantity:</strong> {selectedItem.quantity}</p>}
                      <p><strong>Posted by:</strong> {selectedItem?.user}</p>
                    </div>
                  </div>
                </div>
                <div className="donations-chat-info">
                  <p>Send a message to <strong>{selectedItem?.user}</strong> about their {selectedItem?.type === 'donation' ? 'donation' : 'request'}: <strong>{selectedItem?.title}</strong></p>
                </div>
                <textarea
                  className="donations-chat-textarea"
                  placeholder={`Write a message...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                />
                <div className="donations-char-count">{message.length}/500</div>
              </div>
              <div className="donations-modal-footer">
                <div className="donations-chat-actions">
                  <button className="donations-cancel-button" onClick={closeChatModal}>Cancel</button>
                  <button className="donations-send-button" onClick={handleSendMessage} disabled={!message.trim()}>Send Message</button>
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