import { useEffect, useRef, useState } from 'react';
import './PostItemModal.css';

function PostItemModal({ onClose, defaultType }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const [selectedType, setSelectedType] = useState(
    defaultType ? defaultType.toLowerCase() : ''
  );

  useEffect(() => {
    if (defaultType) {
      setSelectedType(defaultType.toLowerCase());
    }
  }, [defaultType]);

  const handleTypeClick = (type) => {
    setSelectedType(type);
  };

  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
  const files = Array.from(e.target.files);
  const newImages = files.map((file) => ({
    file,
    preview: URL.createObjectURL(file),
  }));
  setImages((prev) => [...prev, ...newImages]);
  fileInputRef.current.value = null; // Reset input
};

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[indexToRemove].preview); // free memory
      updated.splice(indexToRemove, 1);
      return updated;
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">
          <span className="plus-icon">➕</span> Post an Item
        </h2>

        <form className="post-form">
          <label className="form-label">
            <span className="form-icon">🏷️</span> Item Title
            <input type="text" placeholder="What are you posting?" />
          </label>

          <label className="form-label">
            <span className="form-icon">💬</span> Description
            <textarea placeholder="Describe your item in detail..." rows="4" />
          </label>

          <div className="form-row">
            <label className="form-label type-category-container">
              <span className="form-icon">🔁</span> Item Type
              <div className="item-type-buttons">
                {['trade', 'rent', 'lost', 'found'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`type-button ${selectedType === type ? 'active' : ''} ${
                      defaultType &&
                      (defaultType.toLowerCase() === 'lost' ||
                        defaultType.toLowerCase() === 'found') &&
                      selectedType !== type
                        ? 'disabled'
                        : ''
                    }`}
                    onClick={() => handleTypeClick(type)}
                    disabled={
                      defaultType &&
                      (defaultType.toLowerCase() === 'lost' ||
                        defaultType.toLowerCase() === 'found') &&
                      selectedType !== type
                    }
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </label>

            <label className="form-label type-category-container">
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
  <div
    className={`upload-box ${images.length > 0 ? 'has-files' : ''}`}
    onClick={(e) => {
      if (e.target.classList.contains('browse-files')) {
        fileInputRef.current.click();
      }
    }}
  >
    {images.length === 0 ? (
      <>
        Drag & drop or <span className="browse-files"> Browse Files</span>
      </>
    ) : (
      <div className="image-previews">
        {images.map((img, index) => (
          <div key={index} className="image-preview-item">
            <img
              src={img.preview}
              alt={`upload-${index}`}
              className="preview-image"
            />
            <button
              type="button"
              className="remove-image"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage(index);
              }}
            >
              ×
            </button>
          </div>
        ))}
        <div className="add-more-button" onClick={(e) => {
          e.stopPropagation();
          fileInputRef.current.click();
        }}>
          +
        </div>
      </div>
    )}
    <input
      type="file"
      accept="image/*"
      multiple
      style={{ display: 'none' }}
      ref={fileInputRef}
      onChange={handleImageUpload}
    />
  </div>
</label>

          <div className="form-buttons">
            <button type="button" className="cancel-button" onClick={onClose}>
              ✖ Cancel
            </button>
            <button type="submit" className="post-button">
              ➤ Post Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostItemModal; 