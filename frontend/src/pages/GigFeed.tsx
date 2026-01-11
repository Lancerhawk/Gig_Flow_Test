import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gigApi } from '../api/gigApi';
import type { Gig } from '../api/gigApi';
import PriceDisplay from '../components/PriceDisplay';

const GigFeed = () => {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGigs();

    // Listen for real-time updates
    const handleGigUpdate = (event: CustomEvent) => {
      // Refresh gigs if a gig status changed
      fetchGigs();
    };

    window.addEventListener('gig-updated', handleGigUpdate as EventListener);

    return () => {
      window.removeEventListener('gig-updated', handleGigUpdate as EventListener);
    };
  }, [search]);

  const fetchGigs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await gigApi.getGigs(search || undefined);
      setGigs(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch gigs');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Gig Feed</h1>
            <Link
              to="/gigs/create"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Create Gig
            </Link>
          </div>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search gigs by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : gigs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No gigs found</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {gigs.map((gig) => (
                <Link
                  key={gig._id}
                  to={`/gigs/${gig._id}`}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{gig.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{gig.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-indigo-600">
                      <PriceDisplay priceInINR={gig.budgetInINR || gig.budget} originalCurrency={gig.originalCurrency} />
                    </span>
                    <span className="text-sm text-gray-500">
                      by {gig.ownerId.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GigFeed;
