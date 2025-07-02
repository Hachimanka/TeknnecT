import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import styles from './MyItemsPage.module.css'; // Changed to module

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
      const q = query(collection(db, 'items'), where('uid', '==', userId));
      const querySnapshot = await getDocs(q);
      const userItems = [];

      querySnapshot.forEach((doc) => {
        userItems.push({ id: doc.id, ...doc.data() });
      });

      userItems.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
      });

      setItems(userItems);
    } catch (error) {
      console.error('Error fetching user items:', error);
      alert('Error loading your items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

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
    const categorized = { trade: [], rent: [], lost: [], found: [], donation: [] };
    items.forEach(item => {
      const type = item.type?.toLowerCase();
      if (categorized[type]) categorized[type].push(item);
    });
    return categorized;
  };

  const getFilteredItems = () => {
    return selectedCategory === 'all'
      ? items
      : items.filter(item => item.type?.toLowerCase() === selectedCategory);
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
      <div className={styles.container}>
        <div className={styles.notLoggedIn}>
          <h2>Please log in to view your items</h2>
          <p>You need to be logged in to see your posting history.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>Loading your items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={"PageWrapper page-fade-in"}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>My Items</h1>
          <p>Your posting history organized by category</p>
        </div>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{items.length}</span>
            <span className={styles.statLabel}>Total Items</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{categorizedItems.trade.length}</span>
            <span className={styles.statLabel}>Trade Items</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{categorizedItems.rent.length}</span>
            <span className={styles.statLabel}>Rent Items</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{categorizedItems.lost.length + categorizedItems.found.length}</span>
            <span className={styles.statLabel}>Lost & Found</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{categorizedItems.donation.length}</span>
            <span className={styles.statLabel}>Donations</span>
          </div>
        </div>

        <div className={styles.filterSection}>
          <h3>Filter by Category:</h3>
          <div className={styles.filterButtons}>
            {['all', 'trade', 'rent', 'lost', 'found', 'donation'].map(type => (
              <button
                key={type}
                className={selectedCategory === type ? styles.active : ''}
                onClick={() => setSelectedCategory(type)}
              >
                {getItemTypeIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)} ({categorizedItems[type]?.length || items.length})
              </button>
            ))}
          </div>
        </div>

        <div className={styles.grid}>
          {filteredItems.length === 0 ? (
            <div className={styles.noItems}>
              <h3>No items found</h3>
              <p>
                {selectedCategory === 'all'
                  ? "You haven't posted any items yet."
                  : `You don't have any ${selectedCategory} items.`}
              </p>
            </div>
          ) : (
            filteredItems.map(item => (
              <div key={item.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div
                    className={styles.badge}
                    style={{ backgroundColor: getItemTypeColor(item.type) }}
                  >
                    {getItemTypeIcon(item.type)} {item.type?.toUpperCase()}
                  </div>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeleteItem(item.id)}
                    disabled={deleteLoading === item.id}
                    title="Delete item"
                  >
                    {deleteLoading === item.id ? '...' : '🗑️'}
                  </button>
                </div>

                {item.imageUrls?.[0] && (
                  <div className={styles.image}>
                    <img
                      src={item.imageUrls[0]}
                      alt={item.title}
                      onError={(e) => (e.target.style.display = 'none')}
                    />
                    {item.imageUrls.length > 1 && (
                      <div className={styles.imageCount}>
                        +{item.imageUrls.length - 1}
                      </div>
                    )}
                  </div>
                )}

                <div className={styles.content}>
                  <h3 className={styles.title}>{item.title}</h3>
                  <p className={styles.description}>{item.description}</p>
                  <div className={styles.details}>
                    <div className={styles.row}>
                      <span className={styles.label}>📁 Category:</span>
                      <span className={styles.value}>{item.category}</span>
                    </div>
                    <div className={styles.row}>
                      <span className={styles.label}>📍 Location:</span>
                      <span className={styles.value}>{item.location}</span>
                    </div>
                    <div className={styles.row}>
                      <span className={styles.label}>📅 Posted:</span>
                      <span className={styles.value}>{formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default MyItemsPage;
