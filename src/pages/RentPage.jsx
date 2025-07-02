import React, { useState, useEffect } from 'react';
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
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [defaultItemType, setDefaultItemType] = useState('');
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
          where('type', '==', 'rent'), // Only fetch 'rent' items
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
        console.error("Error fetching items:", err);
      }
    };

    fetchItems();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, category, dateSort]);

  const handleCardClick = (item) => setSelectedItem(item);
  const closeModal = () => setSelectedItem(null);
  
  const openPostModal = () => {
    setDefaultItemType('rent');
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
        messageType: 'rent_inquiry',
        messageContext: `Inquiry about rental item: ${selectedItem.title}`,
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
      <main className="rent-page">
        <h1 className="rent-page-title">Rent & Rental</h1>
        <p className="rent-page-subtitle">Find items to rent or offer your items for rental!</p>

        <div className="rent-action-row">
          <div className="rent-action-buttons">
            <button
              className="rent-post-btn"
              onClick={openPostModal}
            >
              Offer for Rent
            </button>
          </div>

          <div className="rent-search-sort-controls">
            <input
              type="text"
              className="rent-searchbox"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="rent-category-select"
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
              className="rent-date-sort-select"
              value={dateSort}
              onChange={(e) => setDateSort(e.target.value)}
            >
              <option value="Newest">Newest to Oldest</option>
              <option value="Oldest">Oldest to Newest</option>
            </select>
          </div>
        </div>

        <section className="rent-items-section">
          <h2 className="rent-section-title">
            Items For Rent
            {category !== 'All' ? ` in ${category}` : ''}
          </h2>
          
          {currentItems.length === 0 ? (
            <p className="rent-empty-message">
              No rental posts found. Try adjusting your search or filters.
            </p>
          ) : (
            <>
              <div className="rent-items-grid">
                {currentItems.map((item) => (
                  <div
                    key={item.id}
                    className="rent-item-card"
                    onClick={() => handleCardClick(item)}
                  >
                    <div className="rent-item-badge">
                      For Rent
                    </div>
                    <div className="rent-item-image">
                      <img src={item.image} alt="item" />
                    </div>
                    <div className="rent-item-info">
                      <div>
                        <h3 className="rent-item-title">{item.title}</h3>
                        <p className="rent-item-description">{item.description}</p>
                        {item.price && (
                          <p className="rent-item-price">₱{item.price}/day</p>
                        )}
                        <p className="rent-item-date">
                          Posted on: {formatDate(item.createdAt)}
                        </p>
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
                <div className="rent-pagination-controls">
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

        {/* Main Item Modal */}
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
                  <p className="rent-spacing"><strong>Description:</strong> {selectedItem.description}</p>
                  <p className="rent-spacing"><strong>Status:</strong> For Rent</p>
                  <p className="rent-spacing"><strong>Category:</strong> {selectedItem.category || 'N/A'}</p>
                  <p className="rent-spacing"><strong>Location:</strong> {selectedItem.location || 'N/A'}</p>
                  {selectedItem.price && (
                    <p className="rent-spacing"><strong>Price:</strong> ₱{selectedItem.price}/day</p>
                  )}
                  <p className="rent-spacing"><strong>Posted on:</strong> {formatDate(selectedItem.createdAt)}</p>
                  <p className="rent-spacing"><strong>Posted by:</strong> {selectedItem.user}</p>
                </div>
              </div>
              <div className="rent-modal-footer">
                <button className="rent-chat-button" onClick={() => setShowChatModal(true)}>
                  Chat With Owner
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Post Item Modal */}
        {showPostModal && <PostItemModal onClose={closePostModal} defaultType={defaultItemType} />}

        {/* Chat Modal */}
        {showChatModal && (
          <div className="rent-modal-overlay" onClick={closeChatModal}>
            <div className="rent-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="rent-modal-header">
                <button className="rent-modal-close" onClick={closeChatModal}>×</button>
                <h2 className="rent-modal-title">Chat With Owner</h2>
              </div>
              <div className="rent-modal-body">
                <div className="rent-post-reference-card">
                  <div className="rent-post-ref-header">
                    <span className="rent-post-ref-badge">
                      For Rent
                    </span>
                    <h4 className="rent-post-ref-title">{selectedItem?.title}</h4>
                  </div>
                  <div className="rent-post-ref-details">
                    <div className="rent-post-ref-image">
                      <img src={selectedItem?.image} alt="item" />
                    </div>
                    <div className="rent-post-ref-info">
                      <p><strong>Category:</strong> {selectedItem?.category || 'N/A'}</p>
                      <p><strong>Location:</strong> {selectedItem?.location || 'N/A'}</p>
                      {selectedItem?.price && (
                        <p><strong>Price:</strong> ₱{selectedItem.price}/day</p>
                      )}
                      <p><strong>Posted by:</strong> {selectedItem?.user}</p>
                    </div>
                  </div>
                </div>
                <div className="rent-chat-info">
                  <p>Send a message to <strong>{selectedItem?.user}</strong> about their rental listing: <strong>{selectedItem?.title}</strong></p>
                </div>
                <textarea
                  className="rent-chat-textarea"
                  placeholder={`Write a message about the rental "${selectedItem?.title}"...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                />
                <div className="rent-char-count">
                  {message.length}/500 characters
                </div>
              </div>
              <div className="rent-modal-footer">
                <div className="rent-chat-actions">
                  <button className="rent-cancel-button" onClick={closeChatModal}>Cancel</button>
                  <button 
                    className="rent-send-button" 
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

export default RentPage;
