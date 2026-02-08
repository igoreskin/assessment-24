const express = require('express');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../data/items.json');
// Simple in-memory cache for computed stats
const cache = {
  stats: null,
  mtimeMs: 0
};

function computeStats(items) {
  const total = items.length;
  const averagePrice = total === 0 ? 0 : items.reduce((acc, cur) => acc + (cur.price || 0), 0) / total;
  return { total, averagePrice };
}

async function updateCacheIfNeeded() {
  const stat = await fsp.stat(DATA_PATH);
  // If we have a cached value and file hasn't changed, return it
  if (cache.stats && cache.mtimeMs === stat.mtimeMs) {
    return cache.stats;
  }

  const raw = await fsp.readFile(DATA_PATH, 'utf8');
  const items = JSON.parse(raw);
  const stats = computeStats(items);

  cache.stats = stats;
  cache.mtimeMs = stat.mtimeMs;
  return stats;
}

// Watch the data file and invalidate cache immediately on changes
try {
  fs.watchFile(DATA_PATH, { interval: 1000 }, (curr, prev) => {
    if (curr.mtimeMs !== prev.mtimeMs) {
      cache.stats = null;
      cache.mtimeMs = 0;
    }
  });
} catch (err) {
  // If watch cannot be established, we fall back to stat-on-request only
}

// GET /api/stats
router.get('/', async (req, res, next) => {
  try {
    const stats = await updateCacheIfNeeded();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;