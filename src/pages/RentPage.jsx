import React from 'react';
import './RentPage.css';

function RentPage() {
  return (
    <main className="rent-page">
      <h1 className="page-title">For Rent</h1>
      <p className="page-subtitle">Looking for items to rent? Browse the latest offers below.</p>

      <section className="rent-items">
        <div className="rent-card">
          <h3 className="item-title">DSLR Camera (Canon)</h3>
          <p className="item-description">₱500/day — Perfect for events, includes 2 lenses.</p>
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
    </main>
  );
}

export default RentPage;
