import { useState, useEffect } from 'react';
import { bidApi } from '../api/bidApi';
import type { Bid } from '../api/bidApi';
import { useCurrency } from '../contexts/CurrencyContext';

interface BidFormProps {
  gigId: string;
  existingBid?: Bid | null;
  gigCurrency?: 'USD' | 'INR';
  onSuccess: () => void;
  onCancel: () => void;
}

const BidForm = ({ gigId, existingBid, gigCurrency = 'USD', onSuccess, onCancel }: BidFormProps) => {
  const { convertPrice } = useCurrency();
  const [message, setMessage] = useState('');
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingBid) {
      setMessage(existingBid.message);
      // Convert price from INR to gig's original currency
      const priceInINR = existingBid.priceInINR || existingBid.price;
      convertPrice(priceInINR, gigCurrency).then((convertedPrice) => {
        setPrice(convertedPrice.toFixed(2));
      });
    }
  }, [existingBid, convertPrice, gigCurrency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!message || !price) {
      setError('Please fill in all fields');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Price must be a positive number');
      return;
    }

    try {
      setIsLoading(true);
      await bidApi.createBid({
        gigId,
        message,
        price: priceNum,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit bid');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {existingBid ? 'Edit Your Bid' : 'Submit Your Bid'}
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
          Message
        </label>
        <textarea
          id="message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          Your Price ({gigCurrency === 'INR' ? '₹' : '$'})
        </label>
        <p className="text-xs text-gray-500 mb-1">
          Enter price in {gigCurrency === 'INR' ? 'INR (₹)' : 'USD ($)'} - will be converted automatically
        </p>
        <input
          type="number"
          id="price"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? (existingBid ? 'Updating...' : 'Submitting...') : (existingBid ? 'Update Bid' : 'Submit Bid')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default BidForm;
