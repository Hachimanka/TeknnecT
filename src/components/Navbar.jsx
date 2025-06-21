import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaComments, FaUserCircle, FaChevronDown } from 'react-icons/fa';
import './Navbar.css';
import PostItemModal from './PostItemModal';

function Navbar() {
  const [showModal, setShowModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const profileRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (profileRef.current && !profileRef.current.contains(event.target)) {
          setShowProfileMenu(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);
  return (
    <>
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

          <div ref={profileRef} style={{ position: 'relative' }}>
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
            {showProfileMenu && (
              <div className="profile-menu">
                <div className="profile-header">
                  <img 
                    src={require('../assets/dj.jpg')} 
                    alt="Profile"
                    className="avatar-image"
                  />
                  <div className="profile-details">
                    <p className="profile-name">John Doe</p>
                    <p className="profile-email">john@example.com</p>
                  </div>
                </div>
                <hr />
                <Link to="/profile" className="profile-option">View Profile</Link>
                <Link to="/settings" className="profile-option">Settings</Link>
                <button className="logout-button">Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {showModal && (
        <PostItemModal onClose={() => setShowModal(false)} />
      )}
    </>
  );
}

export default Navbar;
