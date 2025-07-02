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
  serverTimestamp,
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
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const q = query(
          collection(db, 'items'),
          where('type', 'in', ['lost', 'found']),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const results = await Promise.all(
          querySnapshot.docs.map(async (docSnap) => {
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
          })
        );

        setItems(results);
      } catch (err) {
        console.error('Error fetching items:', err);
      }
    };

    fetchItems();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, category, dateSort]);

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

    const chatId =
      sender.uid < receiverId
        ? `${sender.uid}_${receiverId}`
        : `${receiverId}_${sender.uid}`;

    try {
      await setDoc(
        doc(db, 'chats', chatId),
        {
          users: [sender.uid, receiverId],
          lastMessage: message.trim(),
          lastMessageTime: serverTimestamp(),
          lastPostId: selectedItem.id,
          lastPostTitle: selectedItem.title,
          lastPostStatus: selectedItem.status,
        },
        { merge: true }
      );

      const messageData = {
        sender: sender.uid,
        senderName: sender.displayName || sender.email,
        text: `[RE: ${selectedItem.status} - ${
          selectedItem.title
        }] ${message.trim()}`,
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
        },
        messageType: 'post_inquiry',
        messageContext: `Inquiry about ${selectedItem.status.toLowerCase()} item: ${
          selectedItem.title
        }`,
        originalMessage: message.trim(),
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
      <main className="lost-found-page">
        <h1 className="lost-found-page-title">Lost & Found</h1>
        <p className="lost-found-page-subtitle">
          Have you lost or found an item? Post it here and help the community!
        </p>

        <div className="lost-found-action-row">
          <div className="lost-found-action-buttons">
            <button
              className="lost-found-report-lost-btn"
              onClick={() => openPostModal('Lost')}
            >
              Report Lost Item
            </button>
            <button
              className="lost-found-report-found-btn"
              onClick={() => openPostModal('Found')}
            >
              Report Found Item
            </button>
          </div>
          
          <div className="lost-found-search-sort-controls">
            <input
              type="text"
              className="lost-found-searchbox"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="lost-found-category-select"
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
              className="lost-found-date-sort-select"
              value={dateSort}
              onChange={(e) => setDateSort(e.target.value)}
            >
              <option value="Newest">Newest to Oldest</option>
              <option value="Oldest">Oldest to Newest</option>
            </select>
          </div>
        </div>

        <section className="lost-found-items-section">
          <h2 className="lost-found-section-title">Recent Posts</h2>
          
          {currentItems.length === 0 ? (
            <p className="lost-found-empty-message">
              No posts found. Try adjusting your search or filters.
            </p>
          ) : (
            <>
              <div className="lost-found-items-grid">
                {currentItems.map((item) => (
                  <div
                    key={item.id}
                    className={`lost-found-item-card ${item.status.toLowerCase()}`}
                    onClick={() => handleCardClick(item)}
                  >
                    <div className={`lost-found-item-badge ${item.status.toLowerCase()}`}>
                      {item.status}
                    </div>
                    <div className="lost-found-item-image">
                      <img src={item.image} alt="item" />
                    </div>
                    <div className={`lost-found-item-info ${item.status.toLowerCase()}`}>
                      <div>
                        <h3 className="lost-found-item-title">{item.title}</h3>
                        <p className="lost-found-item-description">
                          {item.description}
                        </p>
                        <p className="lost-found-item-date">
                          {item.status === 'Lost'
                            ? `Lost on: ${formatDate(item.createdAt)}`
                            : `Found on: ${formatDate(item.createdAt)}`}
                        </p>
                      </div>
                      <div className="lost-found-item-footer">
                        <div className="lost-found-item-user">
                          <img
                            src={item.profile}
                            alt="profile"
                            className="lost-found-profile-pic"
                          />
                          <span>{item.user}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="lost-found-pagination-controls">
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
          <div className="lost-found-modal-overlay" onClick={closeModal}>
            <div className="lost-found-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="lost-found-modal-header">
                <button className="lost-found-modal-close" onClick={closeModal}>
                  ×
                </button>
                <h2 className="lost-found-modal-title">{selectedItem.title}</h2>
              </div>
              <div className="lost-found-modal-body">
                <img
                  src={selectedItem.image}
                  alt="item"
                  className="lost-found-modal-image"
                />
                <div className="lost-found-modal-details">
                  <p className="lost-found-spacing">
                    <strong>Description:</strong> {selectedItem.description}
                  </p>
                  <p className="lost-found-spacing">
                    <strong>Status:</strong> {selectedItem.status}
                  </p>
                  <p className="lost-found-spacing">
                    <strong>Category:</strong> {selectedItem.category || 'N/A'}
                  </p>
                  <p className="lost-found-spacing">
                    <strong>Location:</strong> {selectedItem.location || 'N/A'}
                  </p>
                  <p className="lost-found-spacing">
                    <strong>
                      {selectedItem.status === 'Lost'
                        ? 'Lost on:'
                        : 'Found on:'}
                    </strong>{' '}
                    {formatDate(selectedItem.createdAt)}
                  </p>
                  <p className="lost-found-spacing">
                    <strong>Reported by:</strong> {selectedItem.user}
                  </p>
                </div>
              </div>
              <div className="lost-found-modal-footer">
                <button
                  className="lost-found-chat-button"
                  onClick={() => setShowChatModal(true)}
                >
                  Chat With Uploader
                </button>
              </div>
            </div>
          </div>
        )}

        {showPostModal && (
          <PostItemModal onClose={closePostModal} defaultType={defaultItemType} />
        )}

        {showChatModal && (
          <div className="lost-found-modal-overlay" onClick={() => setShowChatModal(false)}>
            <div className="lost-found-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="lost-found-modal-header">
                <button className="lost-found-modal-close" onClick={closeChatModal}>
                  ×
                </button>
                <h2 className="lost-found-modal-title">Chat With Uploader</h2>
              </div>
              <div className="lost-found-modal-body">
                <div className="lost-found-post-reference-card">
                  <div className="lost-found-post-ref-header">
                    <span className={`lost-found-post-ref-badge ${selectedItem?.status.toLowerCase()}`}>
                      {selectedItem?.status}
                    </span>
                    <h4 className="lost-found-post-ref-title">{selectedItem?.title}</h4>
                  </div>
                  <div className="lost-found-post-ref-details">
                    <div className="lost-found-post-ref-image">
                      <img src={selectedItem?.image} alt="item" />
                    </div>
                    <div className="lost-found-post-ref-info">
                      <p>
                        <strong>Category:</strong> {selectedItem?.category || 'N/A'}
                      </p>
                      <p>
                        <strong>Location:</strong> {selectedItem?.location || 'N/A'}
                      </p>
                      <p>
                        <strong>Posted by:</strong> {selectedItem?.user}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="lost-found-chat-info">
                  <p>
                    Send a message to <strong>{selectedItem?.user}</strong>{' '}
                    about their {selectedItem?.status.toLowerCase()} item:{' '}
                    <strong>{selectedItem?.title}</strong>
                  </p>
                </div>
                <textarea
                  className="lost-found-chat-textarea"
                  placeholder={`Write a message about the ${selectedItem?.status.toLowerCase()} item "${
                    selectedItem?.title
                  }"...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                />
                <div className="lost-found-char-count">{message.length}/500 characters</div>
              </div>
              <div className="lost-found-modal-footer">
                <div className="lost-found-chat-actions">
                  <button className="lost-found-cancel-button" onClick={closeChatModal}>
                    Cancel
                  </button>
                  <button
                    className="lost-found-send-button"
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