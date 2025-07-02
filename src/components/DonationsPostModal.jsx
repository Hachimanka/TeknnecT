import { useEffect, useRef, useState } from 'react';
import { db, storage, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './PostItemModal.css';

function DonationsPostModal({ onClose, defaultType }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const [selectedType, setSelectedType] = useState(defaultType ? defaultType.toLowerCase() : '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (defaultType) {
      setSelectedType(defaultType.toLowerCase());
    }
  }, [defaultType]);

  const handleTypeClick = (type) => {
    setSelectedType(type);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newImages = files.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
    e.target.value = '';
  };

  const handleRemoveImage = (idToRemove) => {
    setImages((prevImages) =>
      prevImages.filter((img) => {
        if (img.id === idToRemove) {
          URL.revokeObjectURL(img.preview);
          return false;
        }
        return true;
      })
    );
  };

  const handleBrowseClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleAddMoreClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handlePost = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const imageUrls = await Promise.all(
        images.map(async (img) => {
          const imageRef = ref(storage, `items/${Date.now()}-${img.file.name}`);
          await uploadBytes(imageRef, img.file);
          return await getDownloadURL(imageRef);
        })
      );

      const user = auth.currentUser;

      await addDoc(collection(db, 'items'), {
        title,
        description,
        category,
        location,
        type: selectedType,
        imageUrls,
        uid: user?.uid || '',
        email: user?.email || '',
        createdAt: serverTimestamp(),
      });

      alert(`✅ ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} item posted successfully!`);
      onClose();
    } catch (err) {
      console.error('❌ Error posting item:', err);
      alert('Error posting item. Try again.');
    }

    setLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">
          <span className="plus-icon">➕</span> Post an Item
        </h2>

        <form className="post-form" onSubmit={handlePost}>
          <div className="form-row">
            <label className="form-label type-category-container">
              <span className="form-icon">🔁</span> Post Type
              <div className="item-type-buttons">
                {['donation', 'request'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`type-button ${selectedType === type ? 'active' : ''} ${
                      defaultType && selectedType !== type ? 'disabled' : ''
                    }`}
                    onClick={() => handleTypeClick(type)}
                    disabled={defaultType && selectedType !== type}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
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
            <span className="form-icon">🏷️</span> Item Title
            <input
              type="text"
              placeholder={`What are you ${selectedType === 'donation' ? 'donating' : 'requesting'}?`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          <label className="form-label">
            <span className="form-icon">💬</span> Description
            <textarea
              placeholder={`Describe the ${selectedType} item...`}
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </label>

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
            <div className={`upload-box ${images.length > 0 ? 'has-files' : ''}`}>
              {images.length === 0 ? (
                <>
                  Drag & drop or{' '}
                  <span className="browse-files" onClick={handleBrowseClick}>
                    Browse Files
                  </span>
                </>
              ) : (
                <div className="image-previews">
                  {images.map((img) => (
                    <div key={img.id} className="image-preview-item">
                      <img src={img.preview} alt={`upload-${img.id}`} className="preview-image" />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveImage(img.id);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button type="button" className="add-more-button" onClick={handleAddMoreClick}>
                    +
                  </button>
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
            <button type="submit" className="post-button" disabled={loading}>
              {loading ? 'Posting...' : `➤ Post ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DonationsPostModal;