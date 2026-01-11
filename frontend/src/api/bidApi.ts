import api from './api';

export interface Bid {
  _id: string;
  gigId: string | {
    _id: string;
    title: string;
    description: string;
    budget: number;
    budgetInINR: number;
    originalCurrency: 'USD' | 'INR';
    status: string;
  };
  freelancerId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    location?: string;
  };
  message: string;
  price: number;
  priceInINR: number;
  status: 'pending' | 'hired' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface CreateBidData {
  gigId: string;
  message: string;
  price: number;
}

export const bidApi = {
  createBid: async (data: CreateBidData): Promise<Bid> => {
    const response = await api.post('/bids', data);
    return response.data;
  },
  getUserBid: async (gigId: string): Promise<Bid | null> => {
    try {
      const response = await api.get(`/bids/user/${gigId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
  getBidsByGig: async (gigId: string): Promise<Bid[]> => {
    const response = await api.get(`/bids/${gigId}`);
    return response.data;
  },
  getMyBids: async (): Promise<Bid[]> => {
    const response = await api.get('/bids/user/my-bids');
    return response.data;
  },
  hireBid: async (bidId: string): Promise<Bid> => {
    const response = await api.patch(`/bids/${bidId}/hire`);
    return response.data;
  },
};
