import { useState, useEffect } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';

interface PriceDisplayProps {
  priceInINR: number;
  originalCurrency?: 'USD' | 'INR';
}

const PriceDisplay = ({ priceInINR, originalCurrency }: PriceDisplayProps) => {
  const { formatPrice } = useCurrency();
  const [displayPrice, setDisplayPrice] = useState<string>('');

  useEffect(() => {
    formatPrice(priceInINR, originalCurrency).then(setDisplayPrice);
  }, [priceInINR, originalCurrency, formatPrice]);

  if (!displayPrice) {
    return <span>...</span>;
  }

  return <span>{displayPrice}</span>;
};

export default PriceDisplay;
