import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import './MyItemsPage.css';

function MyItemsPage() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserItems(currentUser.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserItems = async (userId) => {
    try {
      setLoading(true);
      const itemsRef = collection(db, 'items');
      const q = query(
        itemsRef,
        where('uid', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const userItems = [];
      
      querySnapshot.forEach((doc) => {
        userItems.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Sort by date in JavaScript instead of Firestore
      userItems.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA; // Newest first
      });
      
      setItems(userItems);
    } catch (error) {
      console.error('Error fetching user items:', error);
      console.error('Full error details:', error.message);
      alert('Error loading your items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      setDeleteLoading(itemId);
      await deleteDoc(doc(db, 'items', itemId));
      setItems(items.filter(item => item.id !== itemId));
      alert('Item deleted successfully!');
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const categorizeItems = () => {
    const categorized = {
      trade: [],
      rent: [],
      lost: [],
      found: [],
      donation: []
    };

    items.forEach(item => {
      const type = item.type?.toLowerCase();
      if (categorized[type]) {
        categorized[type].push(item);
      }
    });

    return categorized;
  };

  const getFilteredItems = () => {
    if (selectedCategory === 'all') {
      return items;
    }
    return items.filter(item => item.type?.toLowerCase() === selectedCategory);
  };

  const getItemTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'trade': return '🔄';
      case 'rent': return '🏠';
      case 'lost': return '😰';
      case 'found': return '😊';
      case 'donation': return '❤️';
      default: return '📦';
    }
  };

  const getItemTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'trade': return '#007bff';
      case 'rent': return '#28a745';
      case 'lost': return '#dc3545';
      case 'found': return '#ffc107';
      case 'donation': return '#e83e8c';
      default: return '#6c757d';
    }
  };

  const categorizedItems = categorizeItems();
  const filteredItems = getFilteredItems();

  if (!user) {
    return (
      <div className="my-items-container">
        <div className="not-logged-in">
          <h2>Please log in to view your items</h2>
          <p>You need to be logged in to see your posting history.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="my-items-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-items-container">
      <div className="my-items-header">
        <h1>My Items</h1>
        <p>Your posting history organized by category</p>
      </div>

      <div className="items-stats">
        <div className="stat-card">
          <span className="stat-number">{items.length}</span>
          <span className="stat-label">Total Items</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{categorizedItems.trade.length}</span>
          <span className="stat-label">Trade Items</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{categorizedItems.rent.length}</span>
          <span className="stat-label">Rent Items</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{categorizedItems.lost.length + categorizedItems.found.length}</span>
          <span className="stat-label">Lost & Found</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{categorizedItems.donation.length}</span>
          <span className="stat-label">Donations</span>
        </div>
      </div>

      <div className="filter-section">
        <h3>Filter by Category:</h3>
        <div className="filter-buttons">
          <button 
            className={selectedCategory === 'all' ? 'active' : ''}
            onClick={() => setSelectedCategory('all')}
          >
            All Items ({items.length})
          </button>
          <button 
            className={selectedCategory === 'trade' ? 'active' : ''}
            onClick={() => setSelectedCategory('trade')}
          >
            🔄 Trade ({categorizedItems.trade.length})
          </button>
          <button 
            className={selectedCategory === 'rent' ? 'active' : ''}
            onClick={() => setSelectedCategory('rent')}
          >
            🏠 Rent ({categorizedItems.rent.length})
          </button>
          <button 
            className={selectedCategory === 'lost' ? 'active' : ''}
            onClick={() => setSelectedCategory('lost')}
          >
            😰 Lost ({categorizedItems.lost.length})
          </button>
          <button 
            className={selectedCategory === 'found' ? 'active' : ''}
            onClick={() => setSelectedCategory('found')}
          >
            😊 Found ({categorizedItems.found.length})
          </button>
          <button 
            className={selectedCategory === 'donation' ? 'active' : ''}
            onClick={() => setSelectedCategory('donation')}
          >
            ❤️ Donations ({categorizedItems.donation.length})
          </button>
        </div>
      </div>

      <div className="items-grid">
        {filteredItems.length === 0 ? (
          <div className="no-items">
            <h3>No items found</h3>
            <p>
              {selectedCategory === 'all' 
                ? "You haven't posted any items yet." 
                : `You don't have any ${selectedCategory} items.`
              }
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className="item-card">
              <div className="item-header">
                <div className="item-type-badge" style={{ backgroundColor: getItemTypeColor(item.type) }}>
                  {getItemTypeIcon(item.type)} {item.type?.toUpperCase()}
                </div>
                <button 
                  className="delete-button"
                  onClick={() => handleDeleteItem(item.id)}
                  disabled={deleteLoading === item.id}
                  title="Delete item"
                >
                  {deleteLoading === item.id ? '...' : '🗑️'}
                </button>
              </div>

              {item.imageUrls && item.imageUrls.length > 0 && (
                <div className="item-image">
                  <img 
                    src={item.imageUrls[0]} 
                    alt={item.title}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  {item.imageUrls.length > 1 && (
                    <div className="image-count">+{item.imageUrls.length - 1}</div>
                  )}
                </div>
              )}

              <div className="item-content">
                <h3 className="item-title">{item.title}</h3>
                <p className="item-description">{item.description}</p>
                
                <div className="item-details">
                  <div className="detail-row">
                    <span className="detail-label">📁 Category:</span>
                    <span className="detail-value">{item.category}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">📍 Location:</span>
                    <span className="detail-value">{item.location}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">📅 Posted:</span>
                    <span className="detail-value">{formatDate(item.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MyItemsPage;