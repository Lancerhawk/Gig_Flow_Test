import api from './api';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  isOnboarded?: boolean;
}

export interface OnboardingData {
  phone: string;
  location?: string;
  bio?: string;
}

export const authApi = {
  register: async (data: RegisterData): Promise<User> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  login: async (data: LoginData): Promise<User> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
  getMe: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  completeOnboarding: async (data: OnboardingData): Promise<User> => {
    const response = await api.patch('/auth/onboarding', data);
    return response.data;
  },
};
