import { useEffect } from 'react';
import './PostItemModal.css';

function PostItemModal({ onClose, defaultType }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const [selectedType, setSelectedType] = useState('trade');

  const handleTypeClick = (type) => {
    setSelectedType(type);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">
          <span className="plus-icon">➕</span> Post an Item
        </h2>

        <form className="post-form" onSubmit={handlePost}>
          <label className="form-label">
            <span className="form-icon">🏷️</span> Item Title
            <input
              type="text"
              placeholder="What are you posting?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          <label className="form-label">
            <span className="form-icon">💬</span> Description
            <textarea
              placeholder="Describe your item in detail..."
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </label>

          <div className="form-row">
            <label className="form-label type-category-container">
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

            <label className="form-label type-category-container">
              <span className="form-icon">📁</span> Category
              <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                <option value="">Select category</option>
                <option>Electronics</option>
                <option>Books</option>
                <option>Clothing</option>
                <option>Other</option>
              </select>
            </label>
          </div>

          <label className="form-label">
            <span className="form-icon">📍</span> Location
            <input
              type="text"
              placeholder="Enter location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
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
        </form>
      </div>
    </div>
  );
}

export default PostItemModal; 