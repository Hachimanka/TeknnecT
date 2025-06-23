import React from 'react';
import './LostFoundPage.css';

function LostFoundPage() {
  return (
    <main className="lost-found-page">
      <h1 className="page-title">Lost & Found</h1>
      <p className="page-subtitle">Have you lost or found an item? Post it here and help the community!</p>

      <div className="action-buttons">
        <button className="report-lost-btn">Report Lost Item</button>
        <button className="report-found-btn">Report Found Item</button>
      </div>

      <section className="items-section">
        <h2 className="section-title">Recent Posts</h2>

        <div className="item-card">
          <div className="item-badge">Lost</div>

          <div className="item-image">
            <img src="https://img.icons8.com/ios-filled/100/image.png" alt="placeholder" />
          </div>

          <div className="item-info">
            <div>
              <h3 className="item-title">Calculator</h3>
              <p className="item-description">2nd Edition, Used Once</p>
            </div>
            <div className="item-footer">
              <span className="item-user">Divan J.</span>
              <button className="item-action-button">I Found It</button>
            </div>
          </div>
        </div>

        {/* You can add more item cards here */}
      </section>
    </main>
  );
}

export default LostFoundPage;
