import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ref, onValue, off } from 'firebase/database';
import { auth, db } from '@/src/lib/firebase';
import { UserProfile } from '@/src/types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: any | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true, error: null });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const profileRef = ref(db, `users/${user.uid}`);
    const unsubscribeProfile = onValue(profileRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        // Helper to convert RTDB object-with-keys to array
        const toArray = (obj: any) => {
          if (!obj) return [];
          if (Array.isArray(obj)) return obj;
          return Object.entries(obj).map(([id, val]: [string, any]) => ({
            ...val,
            id: val.id || id
          }));
        };

        const convertedProfile: UserProfile = {
          ...data,
          purchaseHistory: toArray(data.purchaseHistory),
          transactionHistory: toArray(data.transactionHistory),
          notifications: toArray(data.notifications)
        };
        
        setProfile(convertedProfile);
      } else {
        const initialProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'Unknown',
          isAdmin: false,
          currentPackage: null,
          purchaseHistory: [],
          transactionHistory: [],
          notifications: [
            {
              id: Date.now().toString(),
              title: 'Welcome!',
              message: 'Your profile has been initialized.',
              timestamp: Date.now(),
              read: false
            }
          ]
        };
        setProfile(initialProfile);
      }
      setLoading(false);
    }, (err) => {
      console.error("Error fetching profile:", err);
      setError(err);
      setLoading(false);
    });

    return () => off(profileRef, 'value', unsubscribeProfile);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
