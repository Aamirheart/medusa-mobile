import { BACKEND_URL, medusa } from '@/lib/medusa';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initialize() {
      try {
        const token = await AsyncStorage.getItem("auth_token");
        if (token) {
            medusa.client.config.headers = {
                ...medusa.client.config.headers,
                Authorization: `Bearer ${token}`
            };
            const { customer } = await medusa.store.customer.retrieve();
            setCustomer(customer);
        }
      } catch (e) {
        await logout();
      } finally {
        setLoading(false);
      }
    }
    initialize();
  }, []);

  const handleAuthSuccess = async (token: string) => {
    if (!token) throw new Error("No token received");
    await AsyncStorage.setItem("auth_token", token);
    
    medusa.client.config.headers = {
        ...medusa.client.config.headers,
        Authorization: `Bearer ${token}`
    };

    const { customer } = await medusa.store.customer.retrieve();
    setCustomer(customer);
  };

  const login = async (email, password) => {
    try {
        const res = await fetch(`${BACKEND_URL}/auth/customer/emailpass`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-publishable-api-key': medusa.client.config.publishableKey 
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Login failed");
        
        await handleAuthSuccess(data.token);
    } catch (e: any) {
        throw new Error(e.message);
    }
  };

  // ✅ NEW REGISTER FUNCTION
  const register = async (email, password, first_name, last_name) => {
    try {
        const res = await fetch(`${BACKEND_URL}/auth/customer/emailpass/register`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-publishable-api-key': medusa.client.config.publishableKey
            },
            // Passing all details correctly
            body: JSON.stringify({ email, password, first_name, last_name })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Registration failed");

        await handleAuthSuccess(data.token);
    } catch (e: any) {
        throw new Error(e.message);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("auth_token");
    setCustomer(null);
    medusa.client.config.headers = {
        ...medusa.client.config.headers,
        Authorization: ""
    };
  };

  return (
    <AuthContext.Provider value={{ customer, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within <AuthProvider>");
  return context;
};