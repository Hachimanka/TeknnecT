import React from 'react';
import './TradePage.css';

function TradePage() {
  return (
    <main className="trade-page">
      <h1 className="page-title">Trade Items</h1>
      <p className="page-subtitle">Have something to trade? Check out the latest trade offers!</p>

      <section className="trade-items">
        <div className="trade-card">
          <h3 className="item-title">Guitar for Headphones</h3>
          <p className="item-description">Looking to trade an acoustic guitar for good-quality headphones.</p>
        </div>

        <div className="trade-card">
          <h3 className="item-title">Books for Sketch Pads</h3>
          <p className="item-description">Set of 5 novels to trade for unused sketch pads or art supplies.</p>
        </div>

        <div className="trade-card">
          <h3 className="item-title">Old Phone for Backpack</h3>
          <p className="item-description">Working Samsung phone — trade for a sturdy backpack.</p>
        </div>

        <div className="trade-card">
          <h3 className="item-title">Shoes for Basketball</h3>
          <p className="item-description">Almost new size 9 shoes — want to trade for basketball.</p>
        </div>

        {/* Add more trade-card here */}
      </section>
    </main>
  );
}

export default TradePage;
