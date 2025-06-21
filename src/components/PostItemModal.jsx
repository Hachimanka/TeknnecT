import './PostItemModal.css';

function PostItemModal({ onClose }) {
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
            <textarea placeholder="Describe your item in detail..." rows="4"></textarea>
          </label>

          <label className="form-label">
            <span className="form-icon">📁</span> Category
            <select>
              <option>Select a category</option>
              <option>Electronics</option>
              <option>Books</option>
              <option>Clothing</option>
              <option>Other</option>
            </select>
          </label>

          <div className="form-label">
            <span className="form-icon">🔁</span> Item Type
            <div className="item-type-buttons">
              <button type="button" className="type-button">⇄ Trade</button>
              <button type="button" className="type-button">$ Rent</button>
              <button type="button" className="type-button">🔍 Lost</button>
              <button type="button" className="type-button">📍 Found</button>
            </div>
          </div>

          <label className="form-label">
            <span className="form-icon">🖼️</span> Upload Images
            <div className="upload-box">
              Drag & drop images here or <span className="browse-files">Browse Files</span>
            </div>
          </label>

          <label className="form-label">
            <span className="form-icon">📍</span> Location
            <input type="text" placeholder="Enter location" />
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
