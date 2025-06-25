import './PostItemModal.css';
import { useState } from 'react';

function PostItemModal({ onClose }) {
  const [selectedType, setSelectedType] = useState(''); // Initialize as empty string

  const handleTypeClick = (type) => {
    // Toggle the type - if it's already selected, deselect it, otherwise select it
    setSelectedType(selectedType === type ? '' : type);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">

        <h2 className="modal-title">
          <span className="plus-icon">➕</span> Post an Item
        </h2>

        <div className="post-form">

          <label className="form-label">
            <span className="form-icon">🏷️</span> Item Title
            <input type="text" placeholder="What are you posting?" />
          </label>

          <label className="form-label">
            <span className="form-icon">💬</span> Description
            <textarea placeholder="Describe your item..." rows="2"></textarea>
          </label>

          <div className="form-row">
            <label className="form-label" style={{flex: 1}}>
              <span className="form-icon">🔁</span> Item Type
              <div className="item-type-buttons">
                <button 
                  type="button" 
                  className={`type-button ${selectedType === 'trade' ? 'active' : ''}`}
                  onClick={() => handleTypeClick('trade')}
                >
                  Trade
                </button>
                <button 
                  type="button" 
                  className={`type-button ${selectedType === 'rent' ? 'active' : ''}`}
                  onClick={() => handleTypeClick('rent')}
                >
                  Rent
                </button>
                <button 
                  type="button" 
                  className={`type-button ${selectedType === 'lost' ? 'active' : ''}`}
                  onClick={() => handleTypeClick('lost')}
                >
                  Lost
                </button>
                <button 
                  type="button" 
                  className={`type-button ${selectedType === 'found' ? 'active' : ''}`}
                  onClick={() => handleTypeClick('found')}
                >
                  Found
                </button>
              </div>
            </label>

            <label className="form-label" style={{flex: 1}}>
              <span className="form-icon">📁</span> Category
              <select>
                <option>Select category</option>
                <option>Electronics</option>
                <option>Books</option>
                <option>Clothing</option>
                <option>Other</option>
              </select>
            </label>
          </div>

          <label className="form-label">
            <span className="form-icon">📍</span> Location
            <input type="text" placeholder="Enter location" />
          </label>

          <label className="form-label">
            <span className="form-icon">🖼️</span> Upload Images
            <div className="upload-box">
              Drag & drop or <span className="browse-files">Browse Files</span>
            </div>
          </label>

          <div className="form-buttons">
            <button type="button" className="cancel-button" onClick={onClose}>✖ Cancel</button>
            <button type="submit" className="post-button">➤ Post Item</button>
          </div>

        </div>

      </div>
    </div>
  );
}

export default PostItemModal;