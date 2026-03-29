const axios = require('axios');

// Simple in-memory cache — avoids hitting API every request
const cache  = {};
const TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * convertCurrency
 * Converts `amount` from `fromCurrency` to `toCurrency`.
 * Returns { convertedAmount, rate } or null on failure.
 * Failure must NEVER block expense submission — caller handles null.
 */
async function convertCurrency(amount, fromCurrency, toCurrency) {
  if (!fromCurrency || !toCurrency) return null;
  if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
    return { convertedAmount: parseFloat(amount), rate: 1 };
  }

  const cacheKey = `${fromCurrency.toUpperCase()}_${toCurrency.toUpperCase()}`;
  const now      = Date.now();

  if (cache[cacheKey] && now - cache[cacheKey].ts < TTL_MS) {
    const rate = cache[cacheKey].rate;
    return { convertedAmount: parseFloat((amount * rate).toFixed(2)), rate };
  }

  try {
    const url  = `https://api.exchangerate-api.com/v4/latest/${fromCurrency.toUpperCase()}`;
    const { data } = await axios.get(url, { timeout: 5000 });
    const rate = data.rates?.[toCurrency.toUpperCase()];
    if (!rate) return null;

    cache[cacheKey] = { rate, ts: now };
    return { convertedAmount: parseFloat((amount * rate).toFixed(2)), rate };
  } catch {
    return null;
  }
}

module.exports = { convertCurrency };
