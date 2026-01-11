import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { gigApi } from '../api/gigApi';
import type { Gig } from '../api/gigApi';
import { bidApi } from '../api/bidApi';
import type { Bid } from '../api/bidApi';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { useCurrency } from '../contexts/CurrencyContext';
import { addNotification } from '../store/slices/notificationSlice';
import PriceDisplay from '../components/PriceDisplay';
import BidForm from '../components/BidForm';

const GigDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { formatPrice } = useCurrency();
  const [displayBudget, setDisplayBudget] = useState<string>('');
  const [gig, setGig] = useState<Gig | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [userBid, setUserBid] = useState<Bid | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBidForm, setShowBidForm] = useState(false);
  const [showBids, setShowBids] = useState(false);
  
  // Use refs to avoid dependency issues
  const gigRef = useRef<Gig | null>(null);
  const userRef = useRef(user);
  
  // Update refs when values change
  useEffect(() => {
    gigRef.current = gig;
    userRef.current = user;
  }, [gig, user]);

  const fetchUserBid = useCallback(async () => {
    if (!id) return;
    try {
      const bid = await bidApi.getUserBid(id);
      setUserBid(bid);
    } catch (err: any) {
      setUserBid(null);
    }
  }, [id]);

  const fetchBids = useCallback(async () => {
    if (!id) return;
    try {
      const data = await bidApi.getBidsByGig(id);
      setBids(data);
      setShowBids(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch bids');
    }
  }, [id]);

  const fetchGig = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await gigApi.getGig(id);
      setGig(data);
      
      // Update display budget
      if (data.budgetInINR) {
        formatPrice(data.budgetInINR || data.budget, data.originalCurrency).then(setDisplayBudget);
      }

      // If user is the owner, fetch bids
      if (user && data.ownerId._id === user._id) {
        try {
          const bidsData = await bidApi.getBidsByGig(id);
          setBids(bidsData);
          setShowBids(true);
        } catch (err: any) {
          // Ignore errors for bids
        }
      }

      // If user is not the owner, check if they have a bid
      if (user && data.ownerId._id !== user._id && data.status === 'open') {
        try {
          const bid = await bidApi.getUserBid(id);
          setUserBid(bid);
        } catch (err: any) {
          setUserBid(null);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch gig');
    } finally {
      setIsLoading(false);
    }
  }, [id, user, formatPrice]);

  // Initial fetch
  useEffect(() => {
    if (id) {
      fetchGig();
    }
  }, [id, fetchGig]);

  // Set up event listeners only once
  useEffect(() => {
    if (!id) return;

    const handleGigUpdate = (event: CustomEvent) => {
      if (event.detail.gigId === id) {
        fetchGig();
      }
    };

    const handleHireConfirmed = (event: CustomEvent) => {
      if (event.detail.gigId === id) {
        fetchGig();
        if (gigRef.current && userRef.current && gigRef.current.ownerId._id === userRef.current._id) {
          fetchBids();
        }
      }
    };

    const handleNewBid = (event: CustomEvent) => {
      if (event.detail.gigId === id) {
        if (gigRef.current && userRef.current) {
          if (gigRef.current.ownerId._id === userRef.current._id) {
            fetchBids();
          } else {
            fetchUserBid();
          }
        }
      }
    };

    window.addEventListener('gig-updated', handleGigUpdate as EventListener);
    window.addEventListener('hire-confirmed', handleHireConfirmed as EventListener);
    window.addEventListener('new-bid', handleNewBid as EventListener);

    return () => {
      window.removeEventListener('gig-updated', handleGigUpdate as EventListener);
      window.removeEventListener('hire-confirmed', handleHireConfirmed as EventListener);
      window.removeEventListener('new-bid', handleNewBid as EventListener);
    };
  }, [id, fetchGig, fetchBids, fetchUserBid]);

  useEffect(() => {
    if (gig && gig.budgetInINR) {
      formatPrice(gig.budgetInINR || gig.budget, gig.originalCurrency).then(setDisplayBudget);
    }
  }, [gig, formatPrice]);

  const handleHire = async (bidId: string) => {
    if (!window.confirm('Are you sure you want to hire this freelancer?')) {
      return;
    }

    try {
      await bidApi.hireBid(bidId);
      // Real-time updates will handle the refresh via socket events
      // But also refresh immediately for better UX
      await fetchGig();
      await fetchBids();
      
      // Add notification for the hired freelancer (will be sent via socket)
      // Also add notification for the gig owner
      if (gig) {
        dispatch(
          addNotification({
            type: 'gig-assigned',
            message: `You hired a freelancer for "${gig.title}"`,
            gigId: gig._id,
            gigTitle: gig.title,
          })
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to hire freelancer');
    }
  };

  const handleBidCreated = async () => {
    setShowBidForm(false);
    // Refresh user bid
    if (user && gig && user._id !== gig.ownerId._id) {
      await fetchUserBid();
    }
    // If user is the owner, refresh bids
    if (user && gig && user._id === gig.ownerId._id) {
      fetchBids();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (error || !gig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">{error || 'Gig not found'}</div>
      </div>
    );
  }

  const isOwner = user && gig.ownerId._id === user._id;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="text-indigo-600 hover:text-indigo-500 mb-4 inline-block"
        >
          ← Back to Feed
        </Link>

        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{gig.title}</h1>
          <p className="text-gray-600 mb-4 whitespace-pre-wrap">{gig.description}</p>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-2xl font-bold text-indigo-600">
                {displayBudget || '...'}
              </span>
              {gig.originalCurrency && (
                <span className="text-sm text-gray-500 ml-2">({gig.originalCurrency})</span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              <p>Posted by: {gig.ownerId.name}</p>
              {gig.status === 'assigned' && gig.ownerId.phone && (
                <p className="text-blue-600 font-semibold">Contact: {gig.ownerId.phone}</p>
              )}
              <p>Status: <span className={`font-semibold ${gig.status === 'open' ? 'text-green-600' : 'text-gray-600'}`}>
                {gig.status.toUpperCase()}
              </span></p>
            </div>
          </div>
        </div>

        {!isOwner && user && gig.status === 'open' && (
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            {userBid && !showBidForm ? (
              <div className="border border-indigo-200 rounded-lg p-4 bg-indigo-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">Your Submitted Bid</h3>
                    <p className="text-sm text-gray-600 mt-1">{userBid.message}</p>
                  </div>
                  <div className="text-right">
                    <PriceDisplay 
                      priceInINR={userBid.priceInINR || userBid.price} 
                      originalCurrency={typeof userBid.gigId === 'object' ? userBid.gigId.originalCurrency : gig.originalCurrency} 
                    />
                    <span className="text-xs px-2 py-1 rounded bg-indigo-200 text-indigo-800">
                      {userBid.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowBidForm(true)}
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 mt-2"
                >
                  Edit Bid
                </button>
              </div>
            ) : showBidForm ? (
              <BidForm 
                gigId={gig._id} 
                existingBid={userBid}
                gigCurrency={gig.originalCurrency}
                onSuccess={handleBidCreated} 
                onCancel={() => {
                  setShowBidForm(false);
                }} 
              />
            ) : (
              <button
                onClick={() => setShowBidForm(true)}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Submit a Bid
              </button>
            )}
          </div>
        )}

        {isOwner && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Bids</h2>
              {!showBids && (
                <button
                  onClick={fetchBids}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  View Bids
                </button>
              )}
            </div>

            {showBids && (
              <>
                {bids.length === 0 ? (
                  <p className="text-gray-500">No bids yet</p>
                ) : (
                  <div className="space-y-4">
                    {bids.map((bid) => (
                      <div
                        key={bid._id}
                        className={`border rounded-lg p-4 ${
                          bid.status === 'hired'
                            ? 'border-green-500 bg-green-50'
                            : bid.status === 'rejected'
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {bid.freelancerId.name}
                            </h3>
                            <p className="text-sm text-gray-600">{bid.freelancerId.email}</p>
                          </div>
                          <div className="text-right">
                            <PriceDisplay 
                              priceInINR={bid.priceInINR || bid.price} 
                              originalCurrency={typeof bid.gigId === 'object' ? bid.gigId.originalCurrency : gig.originalCurrency} 
                            />
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                bid.status === 'hired'
                                  ? 'bg-green-200 text-green-800'
                                  : bid.status === 'rejected'
                                  ? 'bg-red-200 text-red-800'
                                  : 'bg-gray-200 text-gray-800'
                              }`}
                            >
                              {bid.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3">{bid.message}</p>
                        {bid.status === 'hired' && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm font-semibold text-blue-900 mb-2">Contact Information:</p>
                            {bid.freelancerId.phone && (
                              <p className="text-sm text-blue-700 font-medium">📞 Phone: {bid.freelancerId.phone}</p>
                            )}
                            {bid.freelancerId.location && (
                              <p className="text-sm text-blue-700">📍 Location: {bid.freelancerId.location}</p>
                            )}
                            {bid.freelancerId.email && (
                              <p className="text-sm text-blue-700">✉️ Email: {bid.freelancerId.email}</p>
                            )}
                          </div>
                        )}
                        {bid.status === 'pending' && gig.status === 'open' && (
                          <button
                            onClick={() => handleHire(bid._id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                          >
                            Hire
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GigDetails;
