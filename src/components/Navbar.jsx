import { useRef, useEffect, useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaComments, FaUserCircle, FaChevronDown } from 'react-icons/fa';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
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
  const chatBoxRef = useRef(null);
  const profileMenuRef = useRef(null);
  const chatButtonRef = useRef(null);
  const profileButtonRef = useRef(null);

  const navigate = useNavigate();
  
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
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ Helper Functions
  const isActiveLink = (path) => {
    return window.location.pathname === path;
  };

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleToggleMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode', !darkMode);
  };

  const handleMyItemsClick = () => {
    setShowProfileMenu(false);
    navigate('/my-items');
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
          <Link to="/trade" className={isActiveLink('/trade') ? 'active' : ''}>Trade</Link>
          <Link to="/rent" className={isActiveLink('/rent') ? 'active' : ''}>Rent</Link>
          <Link to="/lost-found" className={isActiveLink('/lost-found') ? 'active' : ''}>Lost & Found</Link>
          <Link to="/donations" className={isActiveLink('/donations') ? 'active' : ''}>Donations</Link>
        </div>

        <div className="navbar-right">
          <div
            className="navbar-icon chat-icon"
            title="Messages"
            onClick={() => setShowChatBox((prev) => !prev)}
            ref={chatButtonRef}
          >
            <FaComments size={24} />
          </div>
          <button className="post-item-button" onClick={() => setShowModal(true)}>
            Post Item
          </button>

          <div
            className="profile-section"
            title="Profile"
            onClick={() => setShowProfileMenu((prev) => !prev)}
            ref={profileButtonRef}
          >
            <FaUserCircle size={28} />
            <FaChevronDown
              size={14}
              className={`dropdown-arrow-icon ${showProfileMenu ? 'rotated' : ''}`}
            />
          </div>
        </div>
      </nav>

      {showProfileMenu && (
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
      
      {showChatBox && (
        <div className="chatbox-wrapper" ref={chatBoxRef}>
          <ChatBox />
        </div>
      )}
    </div>
  );
}

export default Navbar;