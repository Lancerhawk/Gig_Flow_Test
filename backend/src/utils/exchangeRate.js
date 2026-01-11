let exchangeRateCache = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export const getExchangeRate = async () => {
  if (exchangeRateCache && Date.now() - exchangeRateCache.timestamp < CACHE_DURATION) {
    return exchangeRateCache.rate;
  }

  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    const rate = data.rates?.INR || 83;
    
    exchangeRateCache = {
      rate,
      timestamp: Date.now(),
    };
    
    return rate;
  } catch (error) {
    console.error('Failed to fetch exchange rate:', error);
    return 83;
  }
};

export const convertToINR = async (amount, fromCurrency) => {
  if (fromCurrency === 'INR') {
    return amount;
  }
  const rate = await getExchangeRate();
  return amount * rate;
};

export const convertFromINR = async (amount, toCurrency) => {
  if (toCurrency === 'INR') {
    return amount;
  }
  const rate = await getExchangeRate();
  return amount / rate;
};
