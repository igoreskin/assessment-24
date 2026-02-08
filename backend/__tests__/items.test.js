const express = require('express');
const request = require('supertest');
const fs = require('fs');

const itemsRouter = require('../src/routes/items');

describe('Items routes', () => {
  let app;
  let sampleItems;

  beforeEach(() => {
    sampleItems = [
      { id: 1, name: 'Apple', price: 10 },
      { id: 2, name: 'Banana', price: 5 }
    ];

    // Mock fs.promises.readFile to return the current sampleItems
    jest.spyOn(fs.promises, 'readFile').mockImplementation(async () => JSON.stringify(sampleItems));

    // Mock fs.promises.writeFile to update sampleItems when called
    jest.spyOn(fs.promises, 'writeFile').mockImplementation(async (_, data) => {
      sampleItems = JSON.parse(data);
      return;
    });

    app = express();
    app.use(express.json());
    app.use('/api/items', itemsRouter);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('GET /api/items returns all items', async () => {
    const res = await request(app).get('/api/items');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test('GET /api/items supports limit and q', async () => {
    let res = await request(app).get('/api/items').query({ limit: 1 });
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);

    res = await request(app).get('/api/items').query({ q: 'app' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Apple');
  });

  test('GET /api/items/:id returns item or 404', async () => {
    let res = await request(app).get('/api/items/1');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Apple');

    res = await request(app).get('/api/items/999');
    expect(res.status).toBe(404);
  });

  test('POST /api/items creates an item', async () => {
    const newItem = { name: 'Cherry', price: 7 };
    const res = await request(app).post('/api/items').send(newItem);
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Cherry');
    expect(res.body.id).toBeDefined();

    // Ensure writeFile was called and data was updated
    const written = fs.promises.writeFile.mock.calls[0][1];
    const writtenItems = JSON.parse(written);
    expect(writtenItems.some(i => i.name === 'Cherry')).toBe(true);
  });
});
