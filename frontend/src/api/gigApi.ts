import api from './api';

export interface Gig {
  _id: string;
  title: string;
  description: string;
  budget: number;
  budgetInINR: number;
  originalCurrency: 'USD' | 'INR';
  ownerId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    location?: string;
  };
  status: 'open' | 'assigned';
  createdAt: string;
  updatedAt: string;
}

export interface CreateGigData {
  title: string;
  description: string;
  budget: number;
  currency: 'USD' | 'INR';
}

export const gigApi = {
  getGigs: async (search?: string): Promise<Gig[]> => {
    const params = search ? { search } : {};
    const response = await api.get('/gigs', { params });
    return response.data;
  },
  getGig: async (id: string): Promise<Gig> => {
    const response = await api.get(`/gigs/${id}`);
    return response.data;
  },
  getMyGigs: async (): Promise<Gig[]> => {
    const response = await api.get('/gigs/user/my-gigs');
    return response.data;
  },
  createGig: async (data: CreateGigData): Promise<Gig> => {
    const response = await api.post('/gigs', data);
    return response.data;
  },
};
