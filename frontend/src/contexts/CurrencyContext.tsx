import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { getExchangeRate } from '../utils/exchangeRate';

type Currency = 'USD' | 'INR';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (price: number, originalCurrency?: 'USD' | 'INR') => Promise<string>;
  getSymbol: () => string;
  convertPrice: (price: number, originalCurrency: 'USD' | 'INR') => Promise<number>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>('INR');

  const convertPrice = useCallback(async (
    priceInINR: number,
    originalCurrency?: 'USD' | 'INR'
  ): Promise<number> => {
    // Price is always stored in INR, so convert from INR to display currency
    if (currency === 'INR') {
      return priceInINR;
    }
    // Convert from INR to USD
    const rate = await getExchangeRate();
    return priceInINR / rate;
  }, [currency]);

  const formatPrice = useCallback(async (
    priceInINR: number,
    originalCurrency?: 'USD' | 'INR'
  ): Promise<string> => {
    // Price is always in INR, convert to display currency
    const displayPrice = await convertPrice(priceInINR, originalCurrency);

    if (currency === 'INR') {
      return `₹${displayPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
    }
    return `$${displayPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  }, [currency, convertPrice]);

  const getSymbol = useCallback((): string => {
    return currency === 'INR' ? '₹' : '$';
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, getSymbol, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
