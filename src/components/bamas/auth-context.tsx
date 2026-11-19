import { createContext, useContext } from 'react';

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  token?: string;
}

export interface CustomerContextType {
  user: CustomerUser | null;
  ready: boolean;
  login?: (payload: { email: string; password: string }) => Promise<any>;
  register?: (payload: { name: string; email: string; password: string; phone?: string }) => Promise<any>;
  logout?: () => void;
  refreshUser?: () => Promise<void>;
}

export const CustomerContext = createContext<CustomerContextType>({
  user: null,
  ready: false,
});

export const useCustomer = () => useContext(CustomerContext);
