import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import styles from './MyItemsPage.module.css';

function MyItemsPage() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [deleteLoading, setDeleteLoading] = useState(null);
  
  // New state for search and sort
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

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

  // Updated filtering function that includes search
  const getFilteredItems = () => {
    let filtered = items;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.type?.toLowerCase() === selectedCategory);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.category?.toLowerCase().includes(searchLower) ||
        item.location?.toLowerCase().includes(searchLower)
      );
    }

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return dateB - dateA;
        
        case 'oldest':
          const dateA2 = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const dateB2 = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return dateA2 - dateB2;
        
        case 'title-asc':
          return (a.title || '').localeCompare(b.title || '');
        
        case 'title-desc':
          return (b.title || '').localeCompare(a.title || '');
        
        case 'category':
          return (a.category || '').localeCompare(b.category || '');
        
        case 'location':
          return (a.location || '').localeCompare(b.location || '');
        
        default:
          return 0;
      }
    });

    return filtered;
  };

  const handleClearSearch = () => {
    setSearchTerm('');
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
    <button 
      className={selectedCategory === 'all' ? styles.active : ''}
      onClick={() => setSelectedCategory('all')}
    >
      All Items ({items.length})
    </button>
    <button 
      className={selectedCategory === 'trade' ? styles.active : ''}
      onClick={() => setSelectedCategory('trade')}
    >
      🔄 Trade ({categorizedItems.trade.length})
    </button>
    <button 
      className={selectedCategory === 'rent' ? styles.active : ''}
      onClick={() => setSelectedCategory('rent')}
    >
      🏠 Rent ({categorizedItems.rent.length})
    </button>
    <button 
      className={selectedCategory === 'lost' ? styles.active : ''}
      onClick={() => setSelectedCategory('lost')}
    >
      😰 Lost ({categorizedItems.lost.length})
    </button>
    <button 
      className={selectedCategory === 'found' ? styles.active : ''}
      onClick={() => setSelectedCategory('found')}
    >
      😊 Found ({categorizedItems.found.length})
    </button>
    <button 
      className={selectedCategory === 'donation' ? styles.active : ''}
      onClick={() => setSelectedCategory('donation')}
    >
      ❤️ Donations ({categorizedItems.donation.length})
    </button>
  </div>
</div>

      {/* New Search and Sort Section */}
      <div className={styles.searchSortSection}>
  <div className={styles.searchSortHeader}>
    <h4>Search & Sort</h4>
    <span className={styles.resultsCount}>
      Showing {filteredItems.length} of {items.length} items
    </span>
  </div>
  
  <div className={styles.searchSortControls}>
    <div className={styles.searchContainer}>
      <span className={styles.searchIcon}>🔍</span>
      <input
        type="text"
        className={styles.searchInput}
        placeholder="Search by title, description, category, or location..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm && (
        <button 
          className={styles.clearSearch}
          onClick={handleClearSearch}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
    
    <div className={styles.sortContainer}>
      <label className={styles.sortLabel}>Sort by:</label>
      <select 
        className={styles.sortSelect}
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        <option value="newest">📅 Newest first</option>
        <option value="oldest">📅 Oldest first</option>
        <option value="title-asc">🔤 Title A-Z</option>
        <option value="title-desc">🔤 Title Z-A</option>
        <option value="category">📁 Category</option>
        <option value="location">📍 Location</option>
      </select>
    </div>
  </div>
</div>

<div className={styles.itemsList}>
  {filteredItems.length === 0 ? (
    <div className={styles.noItems}>
      <h3>No items found</h3>
      <p>
        {searchTerm 
          ? `No items found matching "${searchTerm}". Try a different search term.`
          : selectedCategory === 'all' 
          ? "You haven't posted any items yet." 
          : `You don't have any ${selectedCategory} items.`
        }
      </p>
    </div>
  ) : (
    filteredItems.map((item) => (
      <div key={item.id} className={styles.itemTile}>
        <div className={styles.itemImageContainer}>
          {item.imageUrls?.length > 0 ? (
            <>
              <img 
                src={item.imageUrls[0]} 
                alt={item.title}
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = 
                    '<div class="image-placeholder">📷 Image not available</div>';
                }}
              />
              {item.imageUrls.length > 1 && (
                <div className={styles.imageCount}>+{item.imageUrls.length - 1}</div>
              )}
            </>
          ) : (
            <div className={styles.imagePlaceholder}>No image</div>
          )}
        </div>
        
        <div className={styles.itemContentWrapper}>
          <div className={styles.itemHeader}>
            <div className={styles.itemTypeBadge} style={{ backgroundColor: getItemTypeColor(item.type) }}>
              {getItemTypeIcon(item.type)} {item.type?.toUpperCase()}
            </div>
            <button 
              className={styles.deleteButton}
              onClick={() => handleDeleteItem(item.id)}
              disabled={deleteLoading === item.id}
              aria-label="Delete item"
            >
              {deleteLoading === item.id ? '...' : '🗑️'}
            </button>
          </div>

          <div className={styles.itemContent}>
            <h3 className={styles.itemTitle} title={item.title}>
              {item.title.length > 50 ? `${item.title.substring(0, 50)}...` : item.title}
            </h3>
            <p className={styles.itemDescription} title={item.description}>
              {item.description.length > 100 
                ? `${item.description.substring(0, 100)}...` 
                : item.description}
            </p>
            
            <div className={styles.itemDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>📁 Category:</span>
                <span className={styles.detailValue} title={item.category}>
                  {item.category.length > 15 
                    ? `${item.category.substring(0, 15)}...` 
                    : item.category}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>📍 Location:</span>
                <span className={styles.detailValue} title={item.location}>
                  {item.location.length > 15 
                    ? `${item.location.substring(0, 15)}...` 
                    : item.location}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>📅 Posted:</span>
                <span className={styles.detailValue}>{formatDate(item.createdAt)}</span>
              </div>
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