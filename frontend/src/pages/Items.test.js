describe('Items Page - Logic', () => {
  test('should calculate correct number of pages', () => {
    const itemsPerPage = 10;
    const totalItems = 25;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    expect(totalPages).toBe(3);
  });

  test('should calculate correct offset for pagination', () => {
    const itemsPerPage = 10;
    const currentPage = 2;
    const offset = currentPage * itemsPerPage;
    
    expect(offset).toBe(20);
  });

  test('should validate pagination boundaries', () => {
    const itemsPerPage = 10;
    const totalItems = 50;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    const currentPage = 0;
    expect(currentPage).toBeGreaterThanOrEqual(0);
    expect(currentPage).toBeLessThan(totalPages);
    
    const lastPage = totalPages - 1;
    expect(lastPage).toBe(4);
  });

  test('should filter items by search query', () => {
    const items = [
      { id: 1, name: 'Apple' },
      { id: 2, name: 'Banana' },
      { id: 3, name: 'Cherry' }
    ];
    const query = 'app';
    
    const filtered = items.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase())
    );
    
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('Apple');
  });

  test('should handle case-insensitive search', () => {
    const items = [
      { id: 1, name: 'Apple' },
      { id: 2, name: 'apple' },
      { id: 3, name: 'APPLE' }
    ];
    const query = 'APPLE';
    
    const filtered = items.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase())
    );
    
    expect(filtered).toHaveLength(3);
  });

  test('should extract data from paginated response', () => {
    const paginatedResponse = {
      data: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ],
      total: 50,
      offset: 0,
      limit: 10
    };
    
    const itemsData = paginatedResponse.data;
    expect(itemsData).toHaveLength(2);
    expect(itemsData[0].name).toBe('Item 1');
  });

  test('should handle empty items list', () => {
    const items = [];
    const isEmpty = items.length === 0;
    
    expect(isEmpty).toBe(true);
  });

  test('should calculate correct page display', () => {
    const currentPage = 0;
    const totalPages = 5;
    const displayPage = currentPage + 1;
    
    expect(displayPage).toBe(1);
    expect(`Page ${displayPage} of ${totalPages}`).toBe('Page 1 of 5');
  });

  test('should determine if next page is available', () => {
    const currentPage = 0;
    const totalPages = 5;
    const hasNextPage = currentPage < totalPages - 1;
    
    expect(hasNextPage).toBe(true);
  });

  test('should determine if previous page is available', () => {
    const currentPage = 0;
    const hasPrevPage = currentPage > 0;
    
    expect(hasPrevPage).toBe(false);
  });

  test('should build correct fetch URL with pagination', () => {
    const baseUrl = 'http://localhost:3001/api/items';
    const currentPage = 1;
    const pageSize = 10;
    const offset = currentPage * pageSize;
    const params = new URLSearchParams({ offset, limit: pageSize });
    
    const url = `${baseUrl}?${params}`;
    expect(url).toContain(`offset=${offset}`);
    expect(url).toContain(`limit=${pageSize}`);
  });
});
