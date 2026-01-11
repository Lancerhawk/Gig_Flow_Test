let exchangeRateCache: { rate: number; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export const getExchangeRate = async (): Promise<number> => {
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

export const convertCurrency = async (
  amount: number,
  fromCurrency: 'USD' | 'INR',
  toCurrency: 'USD' | 'INR'
): Promise<number> => {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const rate = await getExchangeRate();

  if (fromCurrency === 'USD' && toCurrency === 'INR') {
    return amount * rate;
  } else {
    return amount / rate;
  }
};
