import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gigApi } from '../api/gigApi';
import type { Gig } from '../api/gigApi';
import { bidApi } from '../api/bidApi';
import type { Bid } from '../api/bidApi';
import { useAppSelector } from '../hooks/useAppSelector';
import PriceDisplay from '../components/PriceDisplay';

const Dashboard = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<'gigs' | 'bids'>('gigs');
  const [myGigs, setMyGigs] = useState<Gig[]>([]);
  const [myBids, setMyBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'gigs') {
      fetchMyGigs();
    } else {
      fetchMyBids();
    }
  }, [activeTab]);

  const fetchMyGigs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await gigApi.getMyGigs();
      setMyGigs(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch your gigs');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyBids = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await bidApi.getMyBids();
      setMyBids(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch your bids');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Dashboard</h1>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('gigs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'gigs'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Gigs ({myGigs.length})
            </button>
            <button
              onClick={() => setActiveTab('bids')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bids'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Bids ({myBids.length})
            </button>
          </nav>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : activeTab === 'gigs' ? (
          <div>
            {myGigs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">You haven't created any gigs yet.</p>
                <Link
                  to="/gigs/create"
                  className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Create Your First Gig
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {myGigs.map((gig) => (
                  <div
                    key={gig._id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{gig.title}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          gig.status === 'open'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {gig.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-3">{gig.description}</p>
                    <div className="flex justify-between items-center mb-4">
                      <PriceDisplay
                        priceInINR={gig.budgetInINR || gig.budget}
                        originalCurrency={gig.originalCurrency}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/gigs/${gig._id}`}
                        className="flex-1 text-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                      >
                        View Details
                      </Link>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      Created: {new Date(gig.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {myBids.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">You haven't placed any bids yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myBids.map((bid) => {
                  const gig = typeof bid.gigId === 'object' ? bid.gigId : null;
                  return (
                    <div
                      key={bid._id}
                      className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                        bid.status === 'hired'
                          ? 'border-green-500'
                          : bid.status === 'rejected'
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          {gig ? (
                            <Link
                              to={`/gigs/${gig._id}`}
                              className="text-xl font-semibold text-indigo-600 hover:text-indigo-800"
                            >
                              {gig.title}
                            </Link>
                          ) : (
                            <h3 className="text-xl font-semibold text-gray-900">Gig (Deleted)</h3>
                          )}
                          <p className="text-sm text-gray-600 mt-1">{bid.message}</p>
                        </div>
                        <div className="text-right ml-4">
                          <PriceDisplay
                            priceInINR={bid.priceInINR || bid.price}
                            originalCurrency={gig?.originalCurrency}
                          />
                          <span
                            className={`text-xs px-2 py-1 rounded mt-2 block ${
                              bid.status === 'hired'
                                ? 'bg-green-100 text-green-800'
                                : bid.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {bid.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      {gig && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex justify-between items-center text-sm text-gray-600">
                            <span>
                              Budget:{' '}
                              <PriceDisplay
                                priceInINR={gig.budgetInINR || gig.budget}
                                originalCurrency={gig.originalCurrency}
                              />
                            </span>
                            <span>Gig Status: {gig.status.toUpperCase()}</span>
                          </div>
                          {gig.status === 'assigned' && bid.status === 'hired' && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                              <p className="text-sm font-semibold text-blue-900 mb-2">
                                Contact Information:
                              </p>
                              {typeof gig.ownerId === 'object' && gig.ownerId.phone && (
                                <p className="text-sm text-blue-700 font-medium">
                                  📞 Phone: {gig.ownerId.phone}
                                </p>
                              )}
                              {typeof gig.ownerId === 'object' && gig.ownerId.location && (
                                <p className="text-sm text-blue-700">
                                  📍 Location: {gig.ownerId.location}
                                </p>
                              )}
                              {typeof gig.ownerId === 'object' && gig.ownerId.email && (
                                <p className="text-sm text-blue-700">
                                  ✉️ Email: {gig.ownerId.email}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="mt-3 text-xs text-gray-500">
                        Bid placed: {new Date(bid.createdAt).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
