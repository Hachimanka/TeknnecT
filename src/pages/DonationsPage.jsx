import React from 'react';
import './DonationsPage.css';

function DonationsPage() {
  return (
    <div className="PageWrapper"> {/* ✅ Page wrapper added */}
      <main className="donations-page">
        <h1 className="page-title">Donations</h1>
        <p className="page-subtitle">Donate items or see what’s available for donation!</p>

        <section className="donations-items">
          <div className="donation-card">
            <h3 className="item-title">School Supplies</h3>
            <p className="item-description">Notebooks, pens, papers — great for students in need.</p>
          </div>

          <div className="donation-card">
            <h3 className="item-title">Used Clothes</h3>
            <p className="item-description">Clean and wearable clothes for all ages.</p>
          </div>

          <div className="donation-card">
            <h3 className="item-title">Canned Goods</h3>
            <p className="item-description">Canned food ready for donation.</p>
          </div>

          <div className="donation-card">
            <h3 className="item-title">Toys for Kids</h3>
            <p className="item-description">Stuffed toys and puzzles for children.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default DonationsPage;
