import React, { useState } from 'react';
import './DonationsPage.css';
import LogoPlaceholder from '../assets/wakwak.png';
import PostItemModal from '../components/PostItemModal';

function DonationsPage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [defaultItemType, setDefaultItemType] = useState('');
  const [showChatModal, setShowChatModal] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const donations = [
    { title: 'School Supplies', description: 'Notebooks, pens, papers great for students in need.', image: LogoPlaceholder, user: 'Divan J.', profile: require('../assets/dj.jpg'), date: '2023-06-01' },
    { title: 'Used Clothes', description: 'Clean and wearable clothes for all ages.', image: LogoPlaceholder, user: 'Mica H.', profile: require('../assets/dj.jpg'), date: '2023-06-05' },
    { title: 'Used Clothes', description: 'Clean and wearable clothes for all ages.', image: LogoPlaceholder, user: 'Mica H.', profile: require('../assets/dj.jpg'), date: '2023-06-05' },
    { title: 'Used Clothes', description: 'Clean and wearable clothes for all ages.', image: LogoPlaceholder, user: 'Mica H.', profile: require('../assets/dj.jpg'), date: '2023-06-05' },
    { title: 'Used Clothes', description: 'Clean and wearable clothes for all ages.', image: LogoPlaceholder, user: 'Mica H.', profile: require('../assets/dj.jpg'), date: '2023-06-05' },
    { title: 'Used Clothes', description: 'Clean and wearable clothes for all ages.', image: LogoPlaceholder, user: 'Mica H.', profile: require('../assets/dj.jpg'), date: '2023-06-05' }
  ];

  const openPostModal = (type) => {
    setDefaultItemType(type);
    setShowPostModal(true);
  };

  const closePostModal = () => {
    setShowPostModal(false);
    setDefaultItemType('');
  };

  const handleCardClick = (item) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  return (
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

        {/* Add more donation-card here */}
      </section>
    </main>
  );
}

export default DonationsPage;
