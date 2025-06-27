import React, { useState } from 'react';
import './RentPage.css';
import LogoPlaceholder from '../assets/wakwak.png';

function RentPage() {
  const [selectedItem, setSelectedItem] = useState(null);

  const rentItems = [
    { title: 'DSLR Camera (Canon)', description: '₱500/day — Perfect for events, includes 2 lenses.', user: 'Jude M.', image: LogoPlaceholder, profile: require('../assets/dj.jpg') },
    { title: 'Mountain Bike', description: '₱300/day — Good condition, includes helmet.', user: 'Anne L.', image: LogoPlaceholder, profile: require('../assets/dj.jpg') },
    { title: 'Laptop (i5, 8GB RAM)', description: '₱800/day — Suitable for online classes or work.', user: 'Carlo V.', image: LogoPlaceholder, profile: require('../assets/dj.jpg') },
    { title: 'Sound System', description: '₱1,200/day — 2 speakers + 1 subwoofer + mic.', user: 'Kyla P.', image: LogoPlaceholder, profile: require('../assets/dj.jpg') },
  ];

  const handleCardClick = (item) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  return (
    <main className="rent-page">
      <h1 className="page-title">For Rent</h1>
      <p className="page-subtitle">Looking for items to rent? Browse the latest offers below.</p>

      <section className="rent-items-section">
        <h2 className="section-title">Available Items</h2>
        <div className="rent-grid">
          {rentItems.map((item, index) => (
            <div key={index} className="rent-card" onClick={() => handleCardClick(item)}>
              <div className="rent-badge">For Rent</div>

              <div className="rent-image">
                <img src={item.image} alt="item" />
              </div>

              <div className="rent-info">
                <h3 className="item-title">{item.title}</h3>
                <p className="item-description">{item.description}</p>
                <div className="item-footer">
                  <div className="item-user">
                    <img src={item.profile} alt="profile" className="profile-pic" />
                    <span>{item.user}</span>
                  </div>
                  <button className="rent-action-button">Rent Item</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rent-card">
          <h3 className="item-title">Mountain Bike</h3>
          <p className="item-description">₱300/day — Good condition, includes helmet.</p>
        </div>

        <div className="rent-card">
          <h3 className="item-title">Laptop (i5, 8GB RAM)</h3>
          <p className="item-description">₱800/day — Suitable for online classes or work.</p>
        </div>

        <div className="rent-card">
          <h3 className="item-title">Sound System</h3>
          <p className="item-description">₱1,200/day — 2 speakers + 1 subwoofer + mic.</p>
        </div>

        <div className="rent-card">
          <h3 className="item-title">Mountain Bike</h3>
          <p className="item-description">₱300/day — Good condition, includes helmet.</p>
        </div>

        <div className="rent-card">
          <h3 className="item-title">Laptop (i5, 8GB RAM)</h3>
          <p className="item-description">₱800/day — Suitable for online classes or work.</p>
        </div>

        <div className="rent-card">
          <h3 className="item-title">Sound System</h3>
          <p className="item-description">₱1,200/day — 2 speakers + 1 subwoofer + mic.</p>
        </div>
      
      </section>

      {selectedItem && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <h2>{selectedItem.title}</h2>
            <img src={selectedItem.image} alt="Enlarged item" className="modal-image" />
            <p>{selectedItem.description}</p>
            <p><strong>Rent posted by:</strong> {selectedItem.user}</p>
          </div>
        </div>
      )}
    </main>
  );
}

export default RentPage;
