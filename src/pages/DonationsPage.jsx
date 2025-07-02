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

function DonationsPage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [defaultItemType, setDefaultItemType] = useState('');
  const [showChatModal, setShowChatModal] = useState(false);
  const [message, setMessage] = useState('');
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [dateSort, setDateSort] = useState('Newest');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const q = query(
          collection(db, 'items'),
          where('type', 'in', ['donation', 'request']),
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
              status: data.type === 'donation' ? 'Available' : 'Needed',
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
  }, [searchTerm, category, dateSort, filterType]);

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
          postType: selectedItem.type
        },
        messageType: 'donation_inquiry',
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
      const matchesType = 
        filterType === 'all' || 
        (filterType === 'available' && item.type === 'donation') || 
        (filterType === 'needed' && item.type === 'request');
      
      return matchesSearch && matchesCategory && matchesType;
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
      <main className="donations-page">
        <h1 className="donations-page-title">Donations</h1>
        <p className="donations-page-subtitle">
          Share resources with the community or find what you need!
        </p>

        <div className="donations-action-row">
          <div className="donations-action-buttons">
            <button
              className="donations-donate-btn"
              onClick={() => openPostModal('donation')}
            >
              Donate Item
            </button>
            <button
              className="donations-request-btn"
              onClick={() => openPostModal('request')}
            >
              Request Item
            </button>
          </div>
          
          <div className="donations-search-sort-controls">
            <input
              type="text"
              className="donations-searchbox"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="donations-category-select"
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
              className="donations-date-sort-select"
              value={dateSort}
              onChange={(e) => setDateSort(e.target.value)}
            >
              <option value="Newest">Newest to Oldest</option>
              <option value="Oldest">Oldest to Newest</option>
            </select>
          </div>
        </div>

        <div className="donations-filter-buttons">
          <button 
            className={`donations-filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All Items
          </button>
          <button 
            className={`donations-filter-btn ${filterType === 'available' ? 'active' : ''}`}
            onClick={() => setFilterType('available')}
          >
            Available
          </button>
          <button 
            className={`donations-filter-btn ${filterType === 'needed' ? 'active' : ''}`}
            onClick={() => setFilterType('needed')}
          >
            Needed
          </button>
        </div>

        <section className="donations-items-section">
          <h2 className="donations-section-title">
            {filterType === 'all' ? 'All Donations' : 
             filterType === 'available' ? 'Available Items' : 'Requested Items'}
            {category !== 'All' ? ` in ${category}` : ''}
          </h2>
          
          {currentItems.length === 0 ? (
            <p className="donations-empty-message">
              No posts found. Try adjusting your search or filters.
            </p>
          ) : (
            <>
              <div className="donations-items-grid">
                {currentItems.map((item) => (
                  <div
                    key={item.id}
                    className={`donations-item-card ${item.type}`}
                    onClick={() => handleCardClick(item)}
                  >
                    <div className={`donations-item-badge ${item.type}`}>
                      {item.status}
                    </div>
                    <div className="donations-item-image">
                      <img src={item.image} alt="item" />
                    </div>
                    <div className={`donations-item-info ${item.type}`}>
                      <div>
                        <h3 className="donations-item-title">{item.title}</h3>
                        <p className="donations-item-description">
                          {item.description}
                        </p>
                        <p className="donations-item-date">
                          {item.type === 'donation'
                            ? `Available since: ${formatDate(item.createdAt)}`
                            : `Requested on: ${formatDate(item.createdAt)}`}
                        </p>
                        {item.quantity && (
                          <p className="donations-item-quantity">
                            <strong>Quantity:</strong> {item.quantity}
                          </p>
                        )}
                        {item.condition && (
                          <p className="donations-item-condition">
                            <strong>Condition:</strong> {item.condition}
                          </p>
                        )}
                      </div>
                      <div className="donations-item-footer">
                        <div className="donations-item-user">
                          <img
                            src={item.profile}
                            alt="profile"
                            className="donations-profile-pic"
                          />
                          <span>{item.user}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="donations-pagination-controls">
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
          <div className="donations-modal-overlay" onClick={closeModal}>
            <div className="donations-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="donations-modal-header">
                <button className="donations-modal-close" onClick={closeModal}>
                  ×
                </button>
                <h2 className="donations-modal-title">{selectedItem.title}</h2>
              </div>
              <div className="donations-modal-body">
                <img
                  src={selectedItem.image}
                  alt="item"
                  className="donations-modal-image"
                />
                <div className="donations-modal-details">
                  <p className="donations-spacing">
                    <strong>Description:</strong> {selectedItem.description}
                  </p>
                  <p className="donations-spacing">
                    <strong>Status:</strong> {selectedItem.status}
                  </p>
                  <p className="donations-spacing">
                    <strong>Category:</strong> {selectedItem.category || 'N/A'}
                  </p>
                  <p className="donations-spacing">
                    <strong>Location:</strong> {selectedItem.location || 'N/A'}
                  </p>
                  {selectedItem.quantity && (
                    <p className="donations-spacing">
                      <strong>Quantity:</strong> {selectedItem.quantity}
                    </p>
                  )}
                  {selectedItem.condition && (
                    <p className="donations-spacing">
                      <strong>Condition:</strong> {selectedItem.condition}
                    </p>
                  )}
                  {selectedItem.urgency && (
                    <p className="donations-spacing">
                      <strong>Urgency:</strong> {selectedItem.urgency}
                    </p>
                  )}
                  <p className="donations-spacing">
                    <strong>
                      {selectedItem.type === 'donation'
                        ? 'Available since:'
                        : 'Requested on:'}
                    </strong>{' '}
                    {formatDate(selectedItem.createdAt)}
                  </p>
                  <p className="donations-spacing">
                    <strong>
                      {selectedItem.type === 'donation'
                        ? 'Donated by:'
                        : 'Requested by:'}
                    </strong> {selectedItem.user}
                  </p>
                </div>
              </div>
              <div className="donations-modal-footer">
                <button
                  className="donations-chat-button"
                  onClick={() => setShowChatModal(true)}
                >
                  {selectedItem.type === 'donation' ? 'Contact Donor' : 'Contact Requester'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showPostModal && (
          <DonationsPostModal onClose={closePostModal} defaultType={defaultItemType} />
        )}

        {showChatModal && (
          <div className="donations-modal-overlay" onClick={() => setShowChatModal(false)}>
            <div className="donations-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="donations-modal-header">
                <button className="donations-modal-close" onClick={closeChatModal}>
                  ×
                </button>
                <h2 className="donations-modal-title">
                  {selectedItem?.type === 'donation' ? 'Contact Donor' : 'Contact Requester'}
                </h2>
              </div>
              <div className="donations-modal-body">
                <div className="donations-post-reference-card">
                  <div className="donations-post-ref-header">
                    <span className={`donations-post-ref-badge ${selectedItem?.type}`}>
                      {selectedItem?.status}
                    </span>
                    <h4 className="donations-post-ref-title">{selectedItem?.title}</h4>
                  </div>
                  <div className="donations-post-ref-details">
                    <div className="donations-post-ref-image">
                      <img src={selectedItem?.image} alt="item" />
                    </div>
                    <div className="donations-post-ref-info">
                      <p>
                        <strong>Category:</strong> {selectedItem?.category || 'N/A'}
                      </p>
                      <p>
                        <strong>Location:</strong> {selectedItem?.location || 'N/A'}
                      </p>
                      {selectedItem?.quantity && (
                        <p><strong>Quantity:</strong> {selectedItem.quantity}</p>
                      )}
                      <p>
                        <strong>Posted by:</strong> {selectedItem?.user}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="donations-chat-info">
                  <p>
                    Send a message to <strong>{selectedItem?.user}</strong>{' '}
                    about their {selectedItem?.type === 'donation' ? 'donation' : 'request'}:{' '}
                    <strong>{selectedItem?.title}</strong>
                  </p>
                </div>
                <textarea
                  className="donations-chat-textarea"
                  placeholder={`Write a message about the ${selectedItem?.type === 'donation' ? 'donation' : 'request'} "${
                    selectedItem?.title
                  }"...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                />
                <div className="donations-char-count">{message.length}/500 characters</div>
              </div>
              <div className="donations-modal-footer">
                <div className="donations-chat-actions">
                  <button className="donations-cancel-button" onClick={closeChatModal}>
                    Cancel
                  </button>
                  <button
                    className="donations-send-button"
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
