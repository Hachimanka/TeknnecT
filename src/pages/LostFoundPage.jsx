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
          <h3 className="item-title">Black Wallet</h3>
          <p className="item-description">Found near the library entrance on June 20. Contains IDs and cards.</p>
          <p className="item-status found">FOUND</p>
        </div>

        <div className="item-card">
          <h3 className="item-title">iPhone 13 (Red)</h3>
          <p className="item-description">Lost at the cafeteria around 1:00 PM. Please contact if found.</p>
          <p className="item-status lost">LOST</p>
        </div>

        {/* You can add more item cards here */}
      </section>
    </main>
  );
}

export default LostFoundPage;
