import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../../firebaseConfig';
import { 
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export const AuthContext = createContext();

export const useAuth = () => {
    const value = useContext(AuthContext);
    if (!value) {
        throw new Error('useAuth must be wrapped inside AuthContextProvider');
    }
    return value;
};

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(undefined); // undefined means loading

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsAuthenticated(true);
                setUser(user);
                updateUserData(user.uid);
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
        });
        return unsub;
    }, []);

    const updateUserData = async (userId) => {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            let data = docSnap.data();
            setUser(prev => ({ ...prev, ...data }));
        }
    }

    const login = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true };
        } catch (e) {
            let msg = e.message;
            if (msg.includes('auth/invalid-email')) msg = 'Geçersiz e-posta adresi.';
            else if (msg.includes('auth/invalid-credential')) msg = 'Yanlış e-posta veya şifre.';
            else msg = 'Giriş yapılamadı.';
            return { success: false, msg };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            return { success: true };
        } catch (e) {
            return { success: false, msg: e.message, error: e };
        }
    };

    const updateProfileUrl = async (url) => {
        if (!user || (!user.uid && !user.userId)) return false;
        try {
            const uid = user.uid || user.userId;
            await setDoc(doc(db, "users", uid), { profileUrl: url }, { merge: true });
            setUser(prev => ({ ...prev, profileUrl: url }));
            return true;
        } catch(e) {
            console.error(e);
            return false;
        }
    };

    const register = async (email, password, username, profileUrl) => {
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);
            // Create user document in firestore
            await setDoc(doc(db, "users", response.user.uid), {
                username,
                profileUrl: profileUrl || 'https://cvhrma.org/wp-content/uploads/2015/07/default-profile-photo.jpg',
                userId: response.user.uid,
                email,
                createdAt: serverTimestamp(),
                favoritesCount: 0,
                commentCount: 0
            });
            return { success: true, data: response?.user };
        } catch (e) {
            let msg = e.message;
            if (msg.includes('auth/invalid-email')) msg = 'Geçersiz e-posta adresi.';
            else if (msg.includes('auth/email-already-in-use')) msg = 'Bu e-posta adresi zaten kullanımda.';
            else if (msg.includes('auth/weak-password')) msg = 'Şifre çok zayıf (En az 6 karakter olmalı).';
            else msg = 'Kayıt işlemi başarısız oldu.';
            return { success: false, msg };
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, updateProfileUrl }}>
            {children}
        </AuthContext.Provider>
    );
};