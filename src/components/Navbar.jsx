import { useState } from 'react';
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

            {showProfileMenu && (
              <div className="profile-menu">
                <p><strong>John Doe</strong></p>
                <p>john@example.com</p>
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
