import { useRef, useEffect, useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaComments, FaUserCircle, FaChevronDown } from 'react-icons/fa';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, updateDoc, collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './Navbar.css';
import PostItemModal from './PostItemModal';
import { onAuthStateChanged } from 'firebase/auth';
import ChatBox from '../components/Chatbox';

function Navbar() {
  const [showModal, setShowModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [photoURL, setPhotoURL] = useState(null);
  const [showChatBox, setShowChatBox] = useState(false);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const chatBoxRef = useRef(null);
  const profileMenuRef = useRef(null);
  const chatButtonRef = useRef(null);
  const profileButtonRef = useRef(null);

  const navigate = useNavigate();
  
  // Helper function to check authentication and redirect if needed
  const requireAuth = (callback) => {
    if (!user) {
      navigate('/login');
      return false;
    }
    callback();
    return true;
  };

  // Handle protected navigation
  const handleProtectedNavigation = (path) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(path);
  };
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        chatBoxRef.current &&
        !chatBoxRef.current.contains(event.target) &&
        !chatButtonRef.current.contains(event.target)
      ) {
        setShowChatBox(false);
      }

      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target) &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setPhotoURL(userDoc.data().photoURL || null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        // Clear unread count when user logs out
        setTotalUnreadCount(0);
      }
    });

    return () => unsubscribe();
  }, []);

  // 🔔 Listen for unread messages count
  useEffect(() => {
    if (!user) {
      setTotalUnreadCount(0);
      return;
    }

    const setupUnreadListener = async () => {
      try {
        // Get all chats where current user is a participant
        const chatsQuery = query(
          collection(db, 'chats'),
          where('users', 'array-contains', user.uid)
        );
        
        const chatsSnapshot = await getDocs(chatsQuery);
        const unsubscribers = [];

        chatsSnapshot.docs.forEach(chatDoc => {
          const chatId = chatDoc.id;
          
          // Listen for unread messages in each chat
          const unreadQuery = query(
            collection(db, 'chats', chatId, 'messages'),
            where('sender', '!=', user.uid),
            where('read', '==', false)
          );

          const unsubscribe = onSnapshot(unreadQuery, (snapshot) => {
            // Update the total unread count
            let totalUnread = 0;
            
            // We need to recalculate total from all chats
            chatsSnapshot.docs.forEach(async (chatDocForCount) => {
              const chatIdForCount = chatDocForCount.id;
              const unreadQueryForCount = query(
                collection(db, 'chats', chatIdForCount, 'messages'),
                where('sender', '!=', user.uid),
                where('read', '==', false)
              );
              
              const unreadSnapshot = await getDocs(unreadQueryForCount);
              totalUnread += unreadSnapshot.size;
              
              // Set the total after processing all chats
              setTotalUnreadCount(totalUnread);
            });
          }, (error) => {
            console.error('Error listening to unread messages:', error);
          });

          unsubscribers.push(unsubscribe);
        });

        // Return cleanup function
        return () => {
          unsubscribers.forEach(unsub => unsub());
        };
      } catch (error) {
        console.error('Error setting up unread listener:', error);
      }
    };

    setupUnreadListener();
  }, [user]);

  // Alternative simpler approach for unread count
  useEffect(() => {
    if (!user) {
      setTotalUnreadCount(0);
      return;
    }

    const updateUnreadCount = async () => {
      try {
        // Get all chats where current user is a participant
        const chatsQuery = query(
          collection(db, 'chats'),
          where('users', 'array-contains', user.uid)
        );
        
        const chatsSnapshot = await getDocs(chatsQuery);
        let totalUnread = 0;

        // Count unread messages in each chat
        for (const chatDoc of chatsSnapshot.docs) {
          const chatId = chatDoc.id;
          const unreadQuery = query(
            collection(db, 'chats', chatId, 'messages'),
            where('sender', '!=', user.uid),
            where('read', '==', false)
          );
          
          const unreadSnapshot = await getDocs(unreadQuery);
          totalUnread += unreadSnapshot.size;
        }

        setTotalUnreadCount(totalUnread);
      } catch (error) {
        console.error('Error updating unread count:', error);
      }
    };

    // Update count immediately
    updateUnreadCount();

    // Set up interval to update count periodically (every 30 seconds)
    const interval = setInterval(updateUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [user]);

  // ✅ Helper Functions
  const isActiveLink = (path) => {
    return window.location.pathname === path;
  };

  const handleProfileClick = () => {
    requireAuth(() => {
      setShowProfileMenu(!showProfileMenu);
    });
  };

  const handleToggleMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode', !darkMode);
  };

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        navigate('/');
      })
      .catch((error) => {
        console.error('Logout failed:', error);
      });
  };

  const handleMyItemsClick = () => {
    setShowProfileMenu(false);
    navigate('/my-items');
  };

  // Handle chat box toggle with auth check
  const handleChatToggle = () => {
    requireAuth(() => {
      setShowChatBox((prev) => !prev);
    });
  };

  // Handle post item with auth check
  const handlePostItem = () => {
    requireAuth(() => {
      setShowModal(true);
    });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    try {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF)');
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        alert('File size too large (max 2MB)');
        return;
      }

      const fileExtension = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, `profilePictures/${user.uid}/${fileName}`);

      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { photoURL: downloadURL });

      setPhotoURL(downloadURL);
      alert('Profile picture updated!');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture. Please try again.');
    }
  };

  const displayName = user?.email ? user.email.replace('@cit.edu', '') : 'Guest';

  return (
    <div className="page-header" style={{ position: 'relative' }}>
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            <img src={require('../assets/logo.png')} alt="icon" className="logo-img" />
            Tek<span className="highlight">nnec</span>T
          </Link>
        </div>

        <div className="navbar-center">
          <Link to="/" className={isActiveLink('/') ? 'active' : ''}>Home</Link>
          <div 
            onClick={() => handleProtectedNavigation('/trade')} 
            className={`navbar-link ${isActiveLink('/trade') ? 'active' : ''}`}
            style={{ cursor: 'pointer' }}
          >
            Trade
          </div>
          <div 
            onClick={() => handleProtectedNavigation('/rent')} 
            className={`navbar-link ${isActiveLink('/rent') ? 'active' : ''}`}
            style={{ cursor: 'pointer' }}
          >
            Rent
          </div>
          <div 
            onClick={() => handleProtectedNavigation('/lost-found')} 
            className={`navbar-link ${isActiveLink('/lost-found') ? 'active' : ''}`}
            style={{ cursor: 'pointer' }}
          >
            Lost & Found
          </div>
          <div 
            onClick={() => handleProtectedNavigation('/donations')} 
            className={`navbar-link ${isActiveLink('/donations') ? 'active' : ''}`}
            style={{ cursor: 'pointer' }}
          >
            Donations
          </div>
        </div>

        <div className="navbar-right">
          <div
            className="navbar-icon chat-icon"
            title="Messages"
            onClick={handleChatToggle}
            ref={chatButtonRef}
            style={{ position: 'relative', cursor: 'pointer' }}
          >
            <FaComments size={24} />
            {totalUnreadCount > 0 && (
              <span className="message-badge">
                {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
              </span>
            )}
          </div>
          <button className="post-item-button" onClick={handlePostItem}>
            Post Item
          </button>

          <div
            className="profile-section"
            title="Profile"
            onClick={handleProfileClick}
            ref={profileButtonRef}
            style={{ cursor: 'pointer' }}
          >
            <FaUserCircle size={28} />
            <FaChevronDown
              size={14}
              className={`dropdown-arrow-icon ${showProfileMenu ? 'rotated' : ''}`}
            />
          </div>
        </div>
      </nav>

      {showProfileMenu && user && (
        <div className="profile-menu" ref={profileMenuRef}>
          <div className="profile-header">
            <div className="profile-picture-container">
              <img
                src={photoURL || require('../assets/logo.png')}
                alt="Profile"
                className="avatar-image"
                key={photoURL}
              />
              <label htmlFor="file-upload" className="upload-icon">+</label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
            </div>
            <p className="profile-name">{displayName}</p>
            <p className="profile-email">{user?.email || 'Not logged in'}</p>
          </div>

          <hr />
          <button className="mode-toggle" onClick={handleToggleMode}>
            {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </button>
          <hr />
          <button className="my-items-button" onClick={handleMyItemsClick}>
            My Items
          </button>
          <hr />
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}

      {showModal && (
        <PostItemModal onClose={() => setShowModal(false)} />
      )}
      
      {showChatBox && user && (
        <div className="chatbox-wrapper" ref={chatBoxRef}>
          <ChatBox />
        </div>
      )}
    </div>
  );
}

export default Navbar;