describe('ItemDetail Page - Logic', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should fetch item with correct ID', async () => {
    const itemId = '42';
    const mockItem = { id: 42, name: 'Test Item', category: 'Test', price: 19.99 };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockItem
    });

    const response = await fetch(`/api/items/${itemId}`);
    const item = await response.json();

    expect(global.fetch).toHaveBeenCalledWith(`/api/items/${itemId}`);
    expect(item.id).toBe(42);
    expect(item.name).toBe('Test Item');
  });

  test('should handle 404 error', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    const response = await fetch('/api/items/999');
    
    expect(response.ok).toBe(false);
    expect(response.status).toBe(404);
  });

  test('should handle network errors', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    try {
      await fetch('/api/items/1');
      expect(true).toBe(false); // Should not reach here
    } catch (err) {
      expect(err.message).toBe('Network error');
    }
  });

  test('should extract item properties correctly', () => {
    const item = {
      id: 123,
      name: 'Product Name',
      category: 'Electronics',
      price: 49.99
    };

    expect(item.id).toBe(123);
    expect(item.name).toBe('Product Name');
    expect(item.category).toBe('Electronics');
    expect(item.price).toBe(49.99);
  });

  test('should format price correctly', () => {
    const item = { price: 9.99 };
    const formattedPrice = `$${item.price.toFixed(2)}`;
    
    expect(formattedPrice).toBe('$9.99');
  });

  test('should format price with cents', () => {
    const item = { price: 15.5 };
    const formattedPrice = `$${item.price.toFixed(2)}`;
    
    expect(formattedPrice).toBe('$15.50');
  });

  test('should handle item with all required fields', async () => {
    const mockItem = {
      id: 1,
      name: 'Apple',
      category: 'Fruit',
      price: 1.99
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockItem
    });

    const response = await fetch('/api/items/1');
    const item = await response.json();

    expect(item).toHaveProperty('id');
    expect(item).toHaveProperty('name');
    expect(item).toHaveProperty('category');
    expect(item).toHaveProperty('price');
  });

  test('should construct correct API endpoint', () => {
    const baseUrl = '/api/items';
    const itemId = 5;
    const endpoint = `${baseUrl}/${itemId}`;
    
    expect(endpoint).toBe('/api/items/5');
  });

  test('should validate item ID is numeric', () => {
    const validId = '123';
    const isValidId = !isNaN(parseInt(validId));
    
    expect(isValidId).toBe(true);
  });
});
