import React, { useEffect, useState, useCallback } from 'react';
import { FixedSizeList } from 'react-window';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';

function Items() {
  const { items, fetchItems } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  const pageSize = 10;
  const totalPages = Math.ceil(totalItems / pageSize);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    // Use AbortController to cancel fetch if component unmounts
    const params = {
      q: searchQuery,
      offset: currentPage * pageSize,
      limit: pageSize
    };

    fetchItems(controller.signal, params)
      .then((result) => {
        // Result is the paginated response { data, total, offset, limit }
        if (result && typeof result === 'object' && 'total' in result) {
          setTotalItems(result.total);
        } else if (Array.isArray(result)) {
          setTotalItems(result.length);
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error(err);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [fetchItems, searchQuery, currentPage, pageSize]);

  const handleSearch = (e) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    setCurrentPage(0); // Reset to first page on search
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle both old format (array) and new format { data, total, ... }
  const itemsData = Array.isArray(items) ? items : items?.data || [];

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '30px', fontSize: '28px', color: '#333' }}>Items</h1>

      {/* Search Input */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="search-input" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Search Items
        </label>
        <input
          id="search-input"
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={handleSearch}
          aria-label="Search items"
          style={{
            padding: '10px',
            width: '100%',
            maxWidth: '400px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        />
      </div>

      {/* Loading State */}
      {loading && <p style={{ color: '#666', fontStyle: 'italic' }}>Loading...</p>}

      {/* Items List with Virtualization */}
      {!loading && itemsData.length > 0 ? (
        <>
          <VirtualizedItemsList items={itemsData} />

          {/* Pagination Controls */}
          <div style={{ marginTop: '30px', display: 'flex', gap: '15px', alignItems: 'center', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              aria-label="Previous page"
              style={{
                padding: '10px 16px',
                cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 0 ? 0.5 : 1,
                backgroundColor: currentPage === 0 ? '#e0e0e0' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              ← Previous
            </button>

            <span style={{ fontWeight: 'bold', color: '#333' }}>
              Page {currentPage + 1} of {totalPages || 1}
            </span>

            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages - 1}
              aria-label="Next page"
              style={{
                padding: '10px 16px',
                cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage >= totalPages - 1 ? 0.5 : 1,
                backgroundColor: currentPage >= totalPages - 1 ? '#e0e0e0' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Next →
            </button>
          </div>
        </>
      ) : (
        !loading && (
          <p style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '16px' }}>
            No items found. Try adjusting your search.
          </p>
        )
      )}
    </div>
  );
}

// Virtualized items list component using react-window
function VirtualizedItemsList({ items }) {
  const Row = useCallback(({ index, style }) => {
    const item = items[index];
    return (
      <div style={style}>
        <li
          style={{
            padding: '12px',
            borderBottom: '1px solid #eee',
            marginBottom: '0',
            listStyle: 'none'
          }}
        >
          <Link
            to={'/items/' + item.id}
            style={{ textDecoration: 'none', color: '#0066cc' }}
          >
            {item.name} {item.price && `($${item.price})`}
          </Link>
        </li>
      </div>
    );
  }, [items]);

  return (
    <FixedSizeList
      height={400}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}

export default Items;