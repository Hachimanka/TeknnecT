import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaComments, FaUserCircle, FaChevronDown } from 'react-icons/fa';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './Navbar.css';
import PostItemModal from './PostItemModal';
import { onAuthStateChanged } from 'firebase/auth';


function Navbar() {
  const [showModal, setShowModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [photoURL, setPhotoURL] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    console.log('🔄 Auth state changed. Current user:', currentUser);
    try {
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          console.log('📄 User doc found:', userDoc.data());
          setPhotoURL(userDoc.data().photoURL || null);
        } else {
          console.log('⚠️ No user doc found');
        }
      }
    } catch (error) {
      console.error('❌ Error fetching user data:', error);
    }
  });

  return () => unsubscribe();
}, []);



  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
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

 const handlePhotoUpload = async (e) => {
  const file = e.target.files[0];
  if (!file || !user) return;

  try {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF)');
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size too large (max 2MB)');
      return;
    }

    // Generate a unique file name
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExtension}`;

    // Create a storage reference
  const storageRef = ref(storage, `profilePictures/${user.uid}/${fileName}`);

    // Upload the file using Firebase SDK
    const snapshot = await uploadBytes(storageRef, file);
    console.log('Upload successful:', snapshot);

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    console.log('File URL:', downloadURL);

    // Update user Firestore document
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, { photoURL: downloadURL });

    // Update state
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
          <Link to="/">Home</Link>
          <Link to="/trade">Trade</Link>
          <Link to="/rent">Rent</Link>
          <Link to="/lost-found">Lost & Found</Link>
          <Link to="/donations">Donations</Link>
        </div>

        <div className="navbar-right">
          <div className="navbar-icon chat-icon" title="Messages">
            <FaComments size={24} />
          </div>

          <button
            className="post-item-button"
            onClick={() => setShowModal(true)}
          >
            Post Item
          </button>

          <div
            className="profile-section"
            title="Profile"
            onClick={handleProfileClick}
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
  <div className="profile-menu">
    <div className="profile-header">
      <div className="profile-picture-container">
        <img
          src={photoURL || require('../assets/logo.png')}
          alt="Profile"
          className="avatar-image"
          key={photoURL} // ← this is very good
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
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}

      {showModal && (
        <PostItemModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

export default Navbar;
