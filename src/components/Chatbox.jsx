import React, { useState, useEffect, useRef } from 'react';
import '../components/Chatbox.css';
import { FaArrowLeft } from 'react-icons/fa';
import Profile1 from '../assets/dj.jpg';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
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
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [filterMode, setFilterMode] = useState('all');
  const [chatMessages, setChatMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [userProfiles, setUserProfiles] = useState([]);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [lastMessages, setLastMessages] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const messagesEndRef = useRef(null);

  // 🔐 Authentication state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
      
      if (!user) {
        // Clear all state when user logs out
        setActiveChat(null);
        setChatMessages([]);
        setUserProfiles([]);
        setCurrentUserProfile(null);
        setLastMessages({});
        setUnreadCounts({});
      }
    });

    return () => unsubscribe();
  }, []);

  // 👤 Load current user's profile
  useEffect(() => {
    if (!currentUser || isAuthLoading) return;

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
  }, [currentUser, isAuthLoading]);

  // 📋 Fetch users from existing chats instead of all users
  useEffect(() => {
    if (!currentUser || isAuthLoading) return;

    const fetchChatPartners = async () => {
      try {
        // Get all chats where current user is a participant
        const chatsQuery = query(
          collection(db, 'chats'),
          where('users', 'array-contains', currentUser.uid)
        );
        
        const chatsSnapshot = await getDocs(chatsQuery);
        const partnerIds = new Set();
        
        chatsSnapshot.docs.forEach(doc => {
          const users = doc.data().users || [];
          users.forEach(uid => {
            if (uid !== currentUser.uid) {
              partnerIds.add(uid);
            }
          });
        });

        // Fetch profiles for chat partners
        const partners = [];
        for (const uid of partnerIds) {
          try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
              partners.push({ uid, ...userDoc.data() });
            }
          } catch (error) {
            console.error(`Error fetching user ${uid}:`, error);
          }
        }

        setUserProfiles(partners);
      } catch (error) {
        console.error('Error fetching chat partners:', error);
      }
    };

    fetchChatPartners();
  }, [currentUser, isAuthLoading]);

  // 🔁 Load messages from Firestore
  useEffect(() => {
    if (!activeChat || !currentUser || isAuthLoading) return;

    const uid1 = currentUser.uid;
    const uid2 = activeChat.uid;
    const chatId = uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;

    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'));

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Loaded messages:', msgs);
      setChatMessages(msgs);
      
      // Mark messages as read when viewing chat
      markMessagesAsRead(chatId);
      
      setTimeout(() => {
        if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, (error) => {
      console.error('Error listening to messages:', error);
    });

    return () => unsub();
  }, [activeChat, currentUser, isAuthLoading]);

  // 🔃 Listen for last messages and unread counts
  useEffect(() => {
    if (!currentUser || isAuthLoading || userProfiles.length === 0) return;

    const unsubscribers = [];

    userProfiles.forEach(user => {
      const uid1 = currentUser.uid;
      const uid2 = user.uid;
      const chatId = uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;

      // Get last message
      const lastMessageQuery = query(
        collection(db, 'chats', chatId, 'messages'),
        orderBy('timestamp', 'desc'),
        limit(1)
      );

      const lastMsgUnsub = onSnapshot(lastMessageQuery, (snapshot) => {
        if (!snapshot.empty) {
          const lastMsg = snapshot.docs[0].data();
          setLastMessages(prev => ({
            ...prev,
            [user.uid]: lastMsg
          }));
        }
      }, (error) => {
        console.error(`Error listening to last message for ${user.uid}:`, error);
      });

      // Get unread count
      const unreadQuery = query(
        collection(db, 'chats', chatId, 'messages'),
        where('sender', '!=', currentUser.uid),
        where('read', '==', false)
      );

      const unreadUnsub = onSnapshot(unreadQuery, (snapshot) => {
        setUnreadCounts(prev => ({
          ...prev,
          [user.uid]: snapshot.size
        }));
      }, (error) => {
        console.error(`Error listening to unread count for ${user.uid}:`, error);
      });

      unsubscribers.push(lastMsgUnsub, unreadUnsub);
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [userProfiles, currentUser, isAuthLoading]);

  // Mark messages as read
  const markMessagesAsRead = async (chatId) => {
    if (!currentUser) return;

    try {
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
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // 📨 Send a message
  const sendMessage = async () => {
    if (!messageText.trim() || !activeChat || !currentUser) return;

    try {
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
    } catch (error) {
      console.error('Error sending message:', error);
    }
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

  // Updated MessageComponent to use currentUserProfile
  const MessageComponent = ({ msg }) => {
    const isOwnMessage = msg.sender === currentUser.uid;
    
    // Determine if this is a post-related message (works for both LostFound and Trade)
    const isPostMessage = msg.messageType === 'post_inquiry' && msg.postReference;
    const isTradePost = isPostMessage && msg.postReference.postType === 'trade';

    return (
      <div className={`chat-message-row ${isOwnMessage ? 'right' : 'left'}`}>
        {/* Avatar */}
        {!isOwnMessage && (
          <img className="chat-avatar" src={activeChat.photoURL || Profile1} alt="sender" />
        )}
        
        <div className={`message ${isOwnMessage ? 'right' : 'left'}`}>
          {/* Post reference card - works for both Lost/Found and Trade */}
          {isPostMessage && (
            <div className="message-post-reference">
              <div className="post-ref-header">
                <div className="post-ref-header-left">
                  <span className={`post-status-badge ${
                    isTradePost ? 'trade' : msg.postReference.postStatus.toLowerCase()
                  }`}>
                    {isTradePost ? 'TRADE' : msg.postReference.postStatus}
                  </span>
                  <span className="post-ref-title" title={msg.postReference.postTitle}>
                    {msg.postReference.postTitle}
                  </span>
                </div>
              </div>
              
              <div className="post-ref-content">
                <div className="post-ref-details">
                  {msg.postReference.postPrice && msg.postReference.postPrice !== 'N/A' && (
                    <p><strong>Price:</strong> {msg.postReference.postPrice}</p>
                  )}
                  <p><strong>Category:</strong> {msg.postReference.postCategory}</p>
                  <p><strong>Location:</strong> {msg.postReference.postLocation}</p>
                  <p><strong>Posted by:</strong> {msg.postReference.postOwner}</p>
                </div>
                
                {msg.postReference.postImage && (
                  <img 
                    src={msg.postReference.postImage} 
                    alt="Referenced post" 
                    className="post-ref-thumbnail"
                  />
                )}
              </div>
            </div>
          )}

          {/* Message text */}
          <div className="message-content">
            {msg.originalMessage || 
             (msg.text && msg.text.replace(`[RE: ${isTradePost ? 'Trade' : msg.postReference?.postStatus} - ${msg.postReference?.postTitle}] `, ''))}
          </div>
          
          <span className="message-timestamp">
            {msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Current user's avatar - Updated to use currentUserProfile */}
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

  // Show loading while authentication is being determined
  if (isAuthLoading) {
    return <div className="chatbox-container">Loading...</div>;
  }

  // Show login prompt if not authenticated
  if (!currentUser) {
    return <div className="chatbox-container">Please log in to access messages.</div>;
  }

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