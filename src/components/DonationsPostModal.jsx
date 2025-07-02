import { useEffect, useRef, useState } from 'react';
import { db, storage, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './DonationsPostModal.css';

function DonationsPostModal({ onClose, defaultType }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Use defaultType for initial state, fallback to 'donation'
  const [selectedType, setSelectedType] = useState(
    defaultType ? defaultType.toLowerCase() : 'donation'
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

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

  // Camera feature integration
  const handleCameraClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });

        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.playsInline = true;

        const cameraModal = document.createElement('div');
        cameraModal.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.9);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 2000;
        `;

        video.style.cssText = `
          max-width: 90%;
          max-height: 70%;
          border-radius: 10px;
        `;

        const captureBtn = document.createElement('button');
        captureBtn.innerHTML = '📷 Capture Photo';
        captureBtn.style.cssText = `
          margin-top: 20px;
          padding: 15px 30px;
          font-size: 18px;
          background: #2E8B57;
          color: #FFD700;
          border: none;
          border-radius: 25px;
          cursor: pointer;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✖ Close';
        closeBtn.style.cssText = `
          margin-top: 10px;
          padding: 10px 20px;
          font-size: 16px;
          background: #666;
          color: white;
          border: none;
          border-radius: 20px;
          cursor: pointer;
        `;

        cameraModal.appendChild(video);
        cameraModal.appendChild(captureBtn);
        cameraModal.appendChild(closeBtn);
        document.body.appendChild(cameraModal);

        captureBtn.onclick = () => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0);

          canvas.toBlob((blob) => {
            const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
            const newImage = {
              id: Date.now() + Math.random(),
              file,
              preview: URL.createObjectURL(file),
            };
            setImages((prev) => [...prev, newImage]);
            stream.getTracks().forEach(track => track.stop());
            document.body.removeChild(cameraModal);
          }, 'image/jpeg', 0.8);
        };

        closeBtn.onclick = () => {
          stream.getTracks().forEach(track => track.stop());
          document.body.removeChild(cameraModal);
        };

      } catch (error) {
        alert('Camera access denied or not available. Please use file upload instead.');
        if (cameraInputRef.current) {
          cameraInputRef.current.click();
        }
      }
    } else {
      alert('Camera not supported on this device. Please use file upload instead.');
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
    }
  };

  const handleCameraCapture = (e) => {
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
    <div className="modal-overlayd">
      <div className="modal-contentd">
        <h2 className="modal-titled">
          <span className="plus-icond">➕</span> Post an Item
        </h2>

        <form className="post-formd" onSubmit={handlePost}>
          {/* Type Toggle Buttons */}
          <label className="form-labeld">
            <span className="form-icond">🔁</span> Post Type
            <div className="item-type-buttonsd">
              {['donation', 'request'].map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`type-buttond ${selectedType === type ? 'actived' : ''}`}
                  onClick={() => setSelectedType(type)}
                  // Disable the button if it's NOT the defaultType
                  disabled={defaultType && defaultType.toLowerCase() !== type}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </label>

          <label className="form-labeld">
            <span className="form-icond">🏷️</span> Item Title
            <input
              type="text"
              placeholder={`What are you ${selectedType === 'donation' ? 'donating' : 'requesting'}?`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          <label className="form-labeld">
            <span className="form-icond">💬</span> Description
            <textarea
              placeholder={`Describe the ${selectedType} item...`}
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </label>

          <label className="form-labeld">
            <span className="form-icond">📁</span> Category
            <select value={category} onChange={(e) => setCategory(e.target.value)} required>
              <option value="">Select category</option>
              <option>Electronics</option>
              <option>Books</option>
              <option>Clothing</option>
              <option>Other</option>
            </select>
          </label>

          <label className="form-labeld">
            <span className="form-icond">📍</span> Location
            <input
              type="text"
              placeholder="Enter location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </label>

          <label className="form-labeld">
            <span className="form-icond">🖼️</span> Upload Images
            <div className={`upload-boxd ${images.length > 0 ? 'has-filesd' : ''}`}>
              {images.length === 0 ? (
                <div className="upload-optionsd">
                  <div className="upload-textd">
                    <span
                      className="browse-filesd"
                      onClick={handleBrowseClick}
                    >
                      📁 Upload files
                    </span>
                    {' '}or{' '}
                    <span
                      className="camera-linkd"
                      onClick={handleCameraClick}
                    >
                      📷 Use Camera
                    </span>
                  </div>
                </div>
              ) : (
                <div className="image-previewsd">
                  {images.map((img) => (
                    <div key={img.id} className="image-preview-itemd">
                      <img src={img.preview} alt={`upload-${img.id}`} className="preview-imaged" />
                      <button
                        type="button"
                        className="remove-imaged"
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
                  <div className="add-more-optionsd">
                    <button
                      type="button"
                      className="add-more-buttond"
                      onClick={handleAddMoreClick}
                      title="Browse Files"
                    >
                      📁
                    </button>
                    <button
                      type="button"
                      className="camera-button-smalld"
                      onClick={handleCameraClick}
                      title="Take Photo"
                    >
                      📷
                    </button>
                  </div>
                </div>
              )}
              {/* File input for browsing files */}
              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
              {/* Camera input for fallback */}
              <input
                type="file"
                accept="image/*"
                capture
                style={{ display: 'none' }}
                ref={cameraInputRef}
                onChange={handleCameraCapture}
              />
            </div>
          </label>

          <div className="form-buttonsd">
            <button type="button" className="cancel-buttond" onClick={onClose}>
              ✖ Cancel
            </button>
            <button type="submit" className="post-buttond" disabled={loading}>
              {loading ? 'Posting...' : `➤ Post ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DonationsPostModal;