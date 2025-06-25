import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaComments, FaUserCircle, FaChevronDown } from 'react-icons/fa';
import './Navbar.css';
import PostItemModal from './PostItemModal';

function Navbar() {
  const [showModal, setShowModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false); // Dark Mode state
  const location = useLocation(); // Get current location

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleToggleMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode', !darkMode);
  };

  // Function to check if a link is active
  const isActiveLink = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

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
          <Link 
            to="/" 
            className={isActiveLink('/') ? 'active' : ''}
          >
            Home
          </Link>
          <Link 
            to="/trade" 
            className={isActiveLink('/trade') ? 'active' : ''}
          >
            Trade
          </Link>
          <Link 
            to="/rent" 
            className={isActiveLink('/rent') ? 'active' : ''}
          >
            Rent
          </Link>
          <Link 
            to="/lost-found" 
            className={isActiveLink('/lost-found') ? 'active' : ''}
          >
            Lost & Found
          </Link>
          <Link 
            to="/donations" 
            className={isActiveLink('/donations') ? 'active' : ''}
          >
            Donations
          </Link>
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

      {/* Profile menu moved OUTSIDE navbar */}
      {showProfileMenu && (
        <div className="profile-menu">
          <div className="profile-header">
            <img 
              src={require('../assets/logo.png')} 
              alt="Profile"
              className="avatar-image"
            />
            <p className="profile-name">John Doe</p>
            <p className="profile-email">john@example.com</p>
          </div>
          <hr />
          <button className="mode-toggle" onClick={handleToggleMode}>
            {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </button>
          <hr />
          <button className="logout-button">Logout</button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <PostItemModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

export default Navbar;