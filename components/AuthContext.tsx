import { medusa } from '@/lib/medusa';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    async function checkSession() {
      try {
        const { customer } = await medusa.store.customer.retrieve();
        if (customer) setCustomer(customer);
      } catch (e) {
        // Not logged in
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  const login = async (email, password) => {
    // 👇 FIXED LINE: Added "emailpass" as the second argument
    const response = await medusa.auth.login("customer", "emailpass", { 
      email, 
      password 
    });
    
    // After login, fetch the profile
    const { customer } = await medusa.store.customer.retrieve();
    setCustomer(customer);
  };

  const logout = async () => {
    await medusa.auth.logout();
    setCustomer(null);
    await AsyncStorage.removeItem("cart_id");
  };

  return (
    <AuthContext.Provider value={{ customer, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within <AuthProvider>");
  return context;
};