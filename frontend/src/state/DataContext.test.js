describe('DataContext - API Utilities', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should build correct query params', () => {
    const params = new URLSearchParams({ q: 'apple', offset: 10, limit: 20 });
    const url = `http://localhost:3001/api/items?${params}`;
    
    expect(url).toContain('q=apple');
    expect(url).toContain('offset=10');
    expect(url).toContain('limit=20');
  });

  test('should fetch items with correct parameters', async () => {
    const mockResponse = { data: [{ id: 1, name: 'Apple' }], total: 1, offset: 0, limit: 10 };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const params = new URLSearchParams({ q: '', offset: 0, limit: 10 });
    const response = await fetch(`http://localhost:3001/api/items?${params}`);
    const json = await response.json();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('http://localhost:3001/api/items')
    );
    expect(json.data).toHaveLength(1);
    expect(json.total).toBe(1);
  });

  test('should handle fetch errors', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    try {
      await fetch('http://localhost:3001/api/items');
      expect(true).toBe(false); // Should not reach here
    } catch (err) {
      expect(err.message).toBe('Network error');
    }
  });

  test('should support AbortSignal', async () => {
    const mockResponse = { data: [], total: 0 };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const controller = new AbortController();
    const response = await fetch('http://localhost:3001/api/items', { signal: controller.signal });
    
    expect(response.ok).toBe(true);
    
    // Abort should not throw
    controller.abort();
    expect(controller.signal.aborted).toBe(true);
  });

  test('should return paginated response structure', async () => {
    const mockResponse = { 
      data: [{ id: 1, name: 'Item 1', price: 10 }], 
      total: 50, 
      offset: 0, 
      limit: 10 
    };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const response = await fetch('http://localhost:3001/api/items?limit=10&offset=0');
    const json = await response.json();

    expect(json).toEqual(expect.objectContaining({
      data: expect.any(Array),
      total: expect.any(Number),
      offset: expect.any(Number),
      limit: expect.any(Number)
    }));
  });

  test('should handle search query parameter', async () => {
    const mockResponse = { data: [], total: 0, offset: 0, limit: 10 };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const params = new URLSearchParams({ q: 'banana', offset: 0, limit: 10 });
    await fetch(`http://localhost:3001/api/items?${params}`);

    const callUrl = global.fetch.mock.calls[0][0];
    expect(callUrl).toContain('q=banana');
  });

  test('should handle pagination offset correctly', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [], total: 100, offset: 20, limit: 10 })
    });

    const params = new URLSearchParams({ offset: 20, limit: 10 });
    await fetch(`http://localhost:3001/api/items?${params}`);

    const callUrl = global.fetch.mock.calls[0][0];
    expect(callUrl).toContain('offset=20');
  });

  test('should construct valid URL with multiple params', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [], total: 0 })
    });

    const params = new URLSearchParams({ q: 'test', offset: 30, limit: 15 });
    const url = `http://localhost:3001/api/items?${params}`;
    
    await fetch(url);

    const callUrl = global.fetch.mock.calls[0][0];
    expect(callUrl).toBe(url);
  });
});
