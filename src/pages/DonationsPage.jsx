import React, { useState } from 'react';
import './DonationsPage.css';
import LogoPlaceholder from '../assets/wakwak.png';

function DonationsPage() {
  const [selectedItem, setSelectedItem] = useState(null);

  const donations = [
    {
      title: "Notebooks & Pens",
      description: "Gently used notebooks, blue/black pens. Great for freshmen.",
      user: "Clara B.",
      date: "June 22, 2025",
      image: LogoPlaceholder,
      profile: require('../assets/dj.jpg')
    },
    {
      title: "CIT-U Uniform (Medium)",
      description: "Used female uniform, no stains.",
      user: "Jonas C.",
      date: "June 21, 2025",
      image: LogoPlaceholder,
      profile: require('../assets/dj.jpg')
    },
    {
      title: "Scientific Calculator",
      description: "Casio fx-991ES — working and tested.",
      user: "Ella R.",
      date: "June 18, 2025",
      image: LogoPlaceholder,
      profile: require('../assets/dj.jpg')
    },
    {
      title: "Notebooks & Pens",
      description: "Gently used notebooks, blue/black pens. Great for freshmen.",
      user: "Clara B.",
      date: "June 22, 2025",
      image: LogoPlaceholder,
      profile: require('../assets/dj.jpg')
    },
    {
      title: "CIT-U Uniform (Medium)",
      description: "Used female uniform, no stains.",
      user: "Jonas C.",
      date: "June 21, 2025",
      image: LogoPlaceholder,
      profile: require('../assets/dj.jpg')
    },
    {
      title: "Notebooks & Pens",
      description: "Gently used notebooks, blue/black pens. Great for freshmen.",
      user: "Clara B.",
      date: "June 22, 2025",
      image: LogoPlaceholder,
      profile: require('../assets/dj.jpg')
    },
    {
      title: "CIT-U Uniform (Medium)",
      description: "Used female uniform, no stains.",
      user: "Jonas C.",
      date: "June 21, 2025",
      image: LogoPlaceholder,
      profile: require('../assets/dj.jpg')
    },
    {
      title: "Notebooks & Pens",
      description: "Gently used notebooks, blue/black pens. Great for freshmen.",
      user: "Clara B.",
      date: "June 22, 2025",
      image: LogoPlaceholder,
      profile: require('../assets/dj.jpg')
    },
    {
      title: "CIT-U Uniform (Medium)",
      description: "Used female uniform, no stains.",
      user: "Jonas C.",
      date: "June 21, 2025",
      image: LogoPlaceholder,
      profile: require('../assets/dj.jpg')
    }
  ];

  const handleCardClick = (item) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  return (
    <main className="donations-page">
      <h1 className="page-title">Donations</h1>
      <p className="page-subtitle">
        Contribute pre-loved items to the CIT-U community.
      </p>

      <button className="donate-button">Post Donation</button>

      <section className="items-section">
        <h2 className="section-title">Available Donations</h2>
        <div className="items-grid">
          {donations.map((item, index) => (
            <div
              key={index}
              className="item-card"
              onClick={() => handleCardClick(item)}
            >
              <div className="item-badge donation-badge">Donation</div>
              <div className="item-image">
                <img src={item.image} alt={item.title} />
              </div>
              <div className="item-info donation-theme">
                <div>
                  <h3 className="item-title">{item.title}</h3>
                  <p className="item-description">{item.description}</p>
                  <p className="item-date">Uploaded: {item.date}</p>
                </div>
                <div className="item-footer">
                  <div className="item-user">
                    <img src={item.profile} alt="profile" className="profile-pic" />
                    <span>{item.user}</span>
                  </div>
                  <button className="item-action-button violet">Claim</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <h2>{selectedItem.title}</h2>
            <img src={selectedItem.image} alt="Enlarged item" className="modal-image" />
            <p>{selectedItem.description}</p>
            <p><strong>Posted by:</strong> {selectedItem.user}</p>
            <p><strong>Date:</strong> {selectedItem.date}</p>
            <button className="item-action-button violet" style={{ marginTop: '1rem' }}>
              Claim Item
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default DonationsPage;
