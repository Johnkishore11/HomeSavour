import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import axios from 'axios';
import { Platform } from 'react-native';

const AuthContext = createContext();

// NOTE: 10.0.2.2 is the special alias for your host loopback interface in Android emulators
// const API_URL = 'http://10.0.2.2:5000/api';

const API_URL =
    Platform.OS === 'android'
        ? process.env.EXPO_PUBLIC_API_URL_ANDROID
        : process.env.EXPO_PUBLIC_API_URL_IOS;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null); // MongoDB profile
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRegistering, setIsRegistering] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const token = await firebaseUser.getIdToken();

                    let profile = null;
                    try {
                        // Try to fetch existing profile from backend
                        const response = await axios.get(`${API_URL}/auth/profile`, {
                            headers: { Authorization: `Bearer ${token}` },
                            timeout: 8000,
                        });
                        profile = response.data;
                    } catch (profileError) {
                        const status = profileError.response?.status;
                        const msg = profileError.response?.data?.message;

                        if (status === 401) {
                            // User created in Firebase but not yet fully registered in backend DB
                            // Let the manual registration flow handle it.
                            console.log('User not found in local db yet. Pending manual registration...');
                            setUser(firebaseUser);
                            setLoading(false);
                            return;
                        } else if (!status) {
                            // Network error — keep user logged in with cached role if available
                            console.warn('Network error fetching profile, keeping session alive.');
                            setUser(firebaseUser);
                            // Don't change role/profile — keep whatever we had
                            setLoading(false);
                            return;
                        } else {
                            throw profileError;
                        }
                    }

                    if (profile) {
                        setRole(profile.role);
                        setUserProfile(profile);
                    }
                    setUser(firebaseUser);
                } catch (error) {
                    console.error('Auth state error:', error.response?.data || error.message);
                    // Only sign out on real auth failures, not network issues
                    if (error.response?.status === 401 || error.response?.status === 403) {
                        setUser(null);
                        setRole(null);
                        setUserProfile(null);
                    } else {
                        // Network/server issue — keep user logged in
                        setUser(firebaseUser);
                    }
                }
            } else {
                setUser(null);
                setRole(null);
                setUserProfile(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const registerAndSaveToDatabase = async (email, password, userRole, name) => {
        let userCredential;
        try {
            userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUid = userCredential.user.uid;

            const response = await axios.post(`${API_URL}/auth/register`, {
                firebaseUid,
                role: userRole,
                name,
                email,
                location: { type: 'Point', coordinates: [77.2090, 28.6139] },
            });

            // Update local state explicitly so we are perfectly synced
            setRole(response.data.role);
            setUserProfile(response.data);

            return response.data;
        } catch (error) {
            console.error('Registration failed:', error);
            // Rollback Firebase user creation if backend saving failed
            if (userCredential && userCredential.user) {
                try {
                    await userCredential.user.delete();
                } catch (e) {
                    console.error('Failed to cleanup firebase user', e);
                    await signOut(auth);
                }
            }
            throw error;
        }
    };

    const updateProfile = async (updatedData) => {
        try {
            if (!user) throw new Error('No user logged in');
            const token = await user.getIdToken();
            const response = await axios.put(`${API_URL}/auth/profile`, updatedData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUserProfile(response.data);
            return response.data;
        } catch (error) {
            console.error('Profile update failed:', error.response?.data || error.message);
            throw error;
        }
    };

    const login = async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const logout = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{
            user, userProfile, role, loading,
            isRegistering, setIsRegistering,
            registerAndSaveToDatabase, updateProfile, login, logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
