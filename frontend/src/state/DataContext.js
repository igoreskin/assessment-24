import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);

  const fetchItems = useCallback(async (signal, { q = '', offset = 0, limit = 20 } = {}) => {
    const params = new URLSearchParams({ q, offset, limit });
    const res = await fetch(`http://localhost:3001/api/items?${params}`, { signal });
    const json = await res.json();
    // If the fetch was aborted, don't update state
    if (signal && signal.aborted) return;
    setItems(json);
    return json; // Return response so caller can extract pagination info
  }, []);

  return (
    <DataContext.Provider value={{ items, fetchItems }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);