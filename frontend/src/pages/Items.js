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
    <>
      <h1>Items</h1>

      {/* Search Input */}
      <div className="search-container">
        <label htmlFor="search-input">Search Items</label>
        <input
          id="search-input"
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={handleSearch}
          aria-label="Search items"
        />
      </div>

      {/* Loading State */}
      {loading && <p className="loading">Loading...</p>}

      {/* Items List with Virtualization */}
      {!loading && itemsData.length > 0 ? (
        <>
          <VirtualizedItemsList items={itemsData} />

          {/* Pagination Controls */}
          <div className="pagination-controls">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              aria-label="Previous page"
            >
              ← Previous
            </button>

            <span>Page {currentPage + 1} of {totalPages || 1}</span>

            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages - 1}
              aria-label="Next page"
            >
              Next →
            </button>
          </div>
        </>
      ) : (
        !loading && <p className="empty-state">No items found. Try adjusting your search.</p>
      )}
    </>
  );
}

// Virtualized items list component using react-window
function VirtualizedItemsList({ items }) {
  const Row = useCallback(({ index, style }) => {
    const item = items[index];
    return (
      <div style={style}>
        <li>
          <Link to={'/items/' + item.id}>
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