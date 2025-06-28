import React, { useState } from 'react';
import './TradePage.css';
import LogoPlaceholder from '../assets/wakwak.png';
import PostItemModal from '../components/PostItemModal';

function TradePage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [defaultItemType, setDefaultItemType] = useState('');
  const [showChatModal, setShowChatModal] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const trades = [
    { title: 'Textbooks for Trade', description: 'College textbooks in good condition.', image: LogoPlaceholder, user: 'Divan J.', profile: require('../assets/dj.jpg'), date: '2023-06-01' },
    { title: 'Textbooks for Trade', description: 'College textbooks in good condition.', image: LogoPlaceholder, user: 'Divan J.', profile: require('../assets/dj.jpg'), date: '2023-06-01' },
    { title: 'Textbooks for Trade', description: 'College textbooks in good condition.', image: LogoPlaceholder, user: 'Divan J.', profile: require('../assets/dj.jpg'), date: '2023-06-01' },
    { title: 'Textbooks for Trade', description: 'College textbooks in good condition.', image: LogoPlaceholder, user: 'Divan J.', profile: require('../assets/dj.jpg'), date: '2023-06-01' },
    { title: 'Textbooks for Trade', description: 'College textbooks in good condition.', image: LogoPlaceholder, user: 'Divan J.', profile: require('../assets/dj.jpg'), date: '2023-06-01' },
    { title: 'Textbooks for Trade', description: 'College textbooks in good condition.', image: LogoPlaceholder, user: 'Divan J.', profile: require('../assets/dj.jpg'), date: '2023-06-01' },
    { title: 'Calculator', description: 'Scientific calculator in working condition.', image: LogoPlaceholder, user: 'Mica H.', profile: require('../assets/dj.jpg'), date: '2023-06-05' }
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
