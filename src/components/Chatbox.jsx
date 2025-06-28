import React, { useState, useEffect, useRef } from 'react';
import '../components/Chatbox.css';
import { FaArrowLeft } from 'react-icons/fa';
import Profile1 from '../assets/dj.jpg';
import { auth, db } from '../firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  getDocs,
  limit,
  updateDoc,
  where,
  getDoc
} from 'firebase/firestore';

const ChatBox = () => {
  const currentUser = auth.currentUser;
  const [activeChat, setActiveChat] = useState(null);
  const [filterMode, setFilterMode] = useState('all');
  const [chatMessages, setChatMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [userProfiles, setUserProfiles] = useState([]);
  const [currentUserProfile, setCurrentUserProfile] = useState(null); // Added this state
  const [searchText, setSearchText] = useState('');
  const [lastMessages, setLastMessages] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const messagesEndRef = useRef(null);

  // 👤 Load current user's profile
  useEffect(() => {
    if (!currentUser) return;

    const fetchCurrentUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setCurrentUserProfile({ uid: currentUser.uid, ...userDoc.data() });
        } else {
          // Fallback to auth data if no Firestore profile exists
          setCurrentUserProfile({
            uid: currentUser.uid,
            name: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL
          });
        }
      } catch (error) {
        console.error('Error fetching current user profile:', error);
        // Fallback to auth data
        setCurrentUserProfile({
          uid: currentUser.uid,
          name: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL
        });
      }
    };

    fetchCurrentUserProfile();
  }, [currentUser]);

  // 🔁 Load messages from Firestore
  useEffect(() => {
    if (!activeChat || !currentUser) return;

    const uid1 = currentUser.uid;
    const uid2 = activeChat.uid;
    const chatId = uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;

    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'));

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Loaded messages:', msgs); // Debug log
      setChatMessages(msgs);
      
      // Mark messages as read when viewing chat
      markMessagesAsRead(chatId);
      
      setTimeout(() => {
        if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsub();
  }, [activeChat]);

  // 🔃 Fetch user profiles and their last messages
  useEffect(() => {
    if (!currentUser) return;

    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, 'users'));
      const users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
      setUserProfiles(users);
    };
    fetchUsers();

    // Listen for last messages and unread counts for all users
    const fetchLastMessages = () => {
      const otherUsers = userProfiles.filter(user => user.uid !== currentUser.uid);
      
      otherUsers.forEach(user => {
        const uid1 = currentUser.uid;
        const uid2 = user.uid;
        const chatId = uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;

        // Get last message
        const lastMessageQuery = query(
          collection(db, 'chats', chatId, 'messages'),
          orderBy('timestamp', 'desc'),
          limit(1)
        );

        onSnapshot(lastMessageQuery, (snapshot) => {
          if (!snapshot.empty) {
            const lastMsg = snapshot.docs[0].data();
            setLastMessages(prev => ({
              ...prev,
              [user.uid]: lastMsg
            }));
          }
        });

        // Get unread count
        const unreadQuery = query(
          collection(db, 'chats', chatId, 'messages'),
          where('sender', '!=', currentUser.uid),
          where('read', '==', false)
        );

        onSnapshot(unreadQuery, (snapshot) => {
          setUnreadCounts(prev => ({
            ...prev,
            [user.uid]: snapshot.size
          }));
        });
      });
    };

    if (userProfiles.length > 0) {
      fetchLastMessages();
    }
  }, [userProfiles, currentUser]);

  // Mark messages as read
  const markMessagesAsRead = async (chatId) => {
    const unreadQuery = query(
      collection(db, 'chats', chatId, 'messages'),
      where('sender', '!=', currentUser.uid),
      where('read', '==', false)
    );

    const snapshot = await getDocs(unreadQuery);
    const batch = [];
    
    snapshot.docs.forEach(docRef => {
      batch.push(updateDoc(docRef.ref, { read: true }));
    });

    await Promise.all(batch);
  };

  // 📨 Send a message
  const sendMessage = async () => {
    if (!messageText.trim() || !activeChat) return;

    const uid1 = currentUser.uid;
    const uid2 = activeChat.uid;
    const chatId = uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;

    await setDoc(doc(db, 'chats', chatId), {
      users: [uid1, uid2]
    }, { merge: true });

    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      sender: uid1,
      text: messageText,
      timestamp: serverTimestamp(),
      read: false
    });

    setMessageText('');
  };

  // Format timestamp for message preview
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate();
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays <= 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Component to render individual message with post identification
  const MessageComponent = ({ msg }) => {
    const isOwnMessage = msg.sender === currentUser.uid;
    
    return (
      <div className={`chat-message-row ${isOwnMessage ? 'right' : 'left'}`}>
        {!isOwnMessage && (
          <img className="chat-avatar" src={activeChat.photoURL || Profile1} alt="sender" />
        )}
        
        <div className={`message ${isOwnMessage ? 'right' : 'left'}`}>
          {/* Show post reference if this is a post inquiry */}
          {msg.messageType === 'post_inquiry' && msg.postReference && (
            <div className="message-post-reference">
              <div className="post-ref-header">
                <span className={`post-status-badge ${msg.postReference.postStatus.toLowerCase()}`}>
                  {msg.postReference.postStatus}
                </span>
                <span className="post-ref-title">{msg.postReference.postTitle}</span>
              </div>
              {msg.postReference.postImage && (
                <img 
                  src={msg.postReference.postImage} 
                  alt="Referenced post" 
                  className="post-ref-thumbnail"
                />
              )}
              <div className="post-ref-details">
                <small>📍 {msg.postReference.postLocation}</small>
                <small>👤 {msg.postReference.postOwner}</small>
              </div>
            </div>
          )}

          {/* Message content */}
          <div className="message-content">
            {/* Show original message if available, otherwise show text with prefix */}
            {msg.originalMessage || msg.text}
          </div>

          {/* Timestamp */}
          <span className="message-timestamp">
            {msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {isOwnMessage && (
          <img
            className="chat-avatar"
            src={currentUserProfile?.photoURL || Profile1}
            alt="you"
          />
        )}
      </div>
    );
  };

  // Get filtered users and sort so unread appear at top
  const getFilteredUsers = () => {
    let filteredUsers = userProfiles
      .filter(user => user.uid !== currentUser?.uid)
      .filter(user =>
        user.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchText.toLowerCase())
      );

    if (filterMode === 'unread') {
      filteredUsers = filteredUsers.filter(user => unreadCounts[user.uid] > 0);
    }

    // Sort so users with unread messages are at the top
    filteredUsers.sort((a, b) => {
      const unreadA = unreadCounts[a.uid] || 0;
      const unreadB = unreadCounts[b.uid] || 0;

      if (unreadA > 0 && unreadB === 0) return -1;
      if (unreadA === 0 && unreadB > 0) return 1;

      const lastMsgA = lastMessages[a.uid]?.timestamp?.toMillis() || 0;
      const lastMsgB = lastMessages[b.uid]?.timestamp?.toMillis() || 0;

      return lastMsgB - lastMsgA; // Newer messages first if unread count is same
    });

    return filteredUsers;
  };

  // Enhanced message preview that shows post context
  const getMessagePreview = (lastMsg) => {
    if (!lastMsg) return 'Tap to chat';

    let preview = '';
    
    // Add sender prefix using proper profile data
    if (lastMsg.sender === currentUser.uid) {
      preview += 'You: ';
    }

    // Add post context if it's a post inquiry
    if (lastMsg.messageType === 'post_inquiry' && lastMsg.postReference) {
      preview += `[${lastMsg.postReference.postStatus}: ${lastMsg.postReference.postTitle}] `;
    }

    // Add message text (original or with prefix)
    const messageText = lastMsg.originalMessage || lastMsg.text;
    preview += messageText.length > 30 ? `${messageText.substring(0, 30)}...` : messageText;

    return preview;
  };

  return (
    <div className="chatbox-container">
      {!activeChat ? (
        <div className="messages-pane">
          <h2>Messages</h2>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <div className="filter-buttons">
            <button
              className="all"
              onClick={() => setFilterMode('all')}
              style={{ 
                background: filterMode === 'all' ? '#f5c000' : '#fff', 
                color: filterMode === 'all' ? '#fff' : '#a80000', 
                border: filterMode === 'all' ? 'none' : '1px solid #a80000' 
              }}
            >
              All
            </button>
            <button
              className="unread"
              onClick={() => setFilterMode('unread')}
              style={{ 
                background: filterMode === 'unread' ? '#f5c000' : '#fff', 
                color: filterMode === 'unread' ? '#fff' : '#a80000', 
                border: filterMode === 'unread' ? 'none' : '1px solid #a80000' 
              }}
            >
              Unread ({Object.values(unreadCounts).reduce((sum, count) => sum + count, 0)})
            </button>
          </div>

          <div className="message-list">
            {getFilteredUsers().map((user) => {
              const lastMsg = lastMessages[user.uid];
              const unreadCount = unreadCounts[user.uid] || 0;
              const isUnread = unreadCount > 0;

              return (
                <div key={user.uid} className="message-preview" onClick={() => setActiveChat(user)}>
                  <img src={user.photoURL || Profile1} alt="profile" />
                  <div style={{ flex: 1 }}>
                    <strong style={{ color: '#a80000', fontWeight: isUnread ? 'bold' : 'normal' }}>
                      {user.name || user.email}
                    </strong>
                    <p style={{ 
                      margin: 0, 
                      color: isUnread ? '#000' : '#666', 
                      fontWeight: isUnread ? 'bold' : 'normal',
                      fontSize: '14px'
                    }}>
                      {getMessagePreview(lastMsg)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      {lastMsg ? formatMessageTime(lastMsg.timestamp) : '🕒'}
                    </span>
                    {unreadCount > 0 && (
                      <span style={{
                        backgroundColor: '#f5c000',
                        color: 'white',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginTop: '4px'
                      }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="chat-pane">
          <div className="chat-header">
            <FaArrowLeft onClick={() => setActiveChat(null)} />
            <img src={activeChat.photoURL || Profile1} alt="profile" />
            <strong>{activeChat.name || activeChat.email}</strong>
          </div>

          <div className="chat-messages">
            {chatMessages.map((msg) => (
              <MessageComponent key={msg.id} msg={msg} />
            ))}
            <div ref={messagesEndRef}></div>
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage}>{'>'}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;