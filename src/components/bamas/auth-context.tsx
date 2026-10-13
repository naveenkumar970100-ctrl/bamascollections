import { createContext, useContext } from 'react';
import type { User } from '@supabase/supabase-js';
export const CustomerContext = createContext<{user: User | null; ready: boolean}>({user: null, ready: false});
export const useCustomer = () => useContext(CustomerContext);
