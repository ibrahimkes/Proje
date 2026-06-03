import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../../firebaseConfig';
import {
    getAuth,
    initializeAuth,
    getReactNativePersistence,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updatePassword,
    deleteUser,
    sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { log } from 'firebase/firestore/pipelines';
import { useLoading } from './loadingContext';

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
    const [isAuthenticated, setIsAuthenticated] = useState(undefined);
    const { setIsLoading } = useLoading();

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
        setIsLoading(true);
        try {
            const res = await signInWithEmailAndPassword(auth, email, password);
            setIsLoading(false);
            return { success: true };
        } catch (e) {
            let msg = e.message || String(e);
            if (msg.includes('auth/invalid-email')) msg = 'Geçersiz e-posta adresi.';
            else if (msg.includes('auth/invalid-credential')) msg = 'Yanlış e-posta veya şifre.';
            else msg = 'Giriş yapılamadı.';
            setIsLoading(false);
            return { success: false, msg };
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await signOut(auth);
            setIsLoading(false);
            return { success: true };
        } catch (e) {
            setIsLoading(false);
            return { success: false, msg: e.message, error: e };
        }
    };

    const updateProfileUrl = async (url) => {
        if (!user || (!user.uid && !user.userId)) return false;
        setIsLoading(true);
        try {
            const uid = user.uid || user.userId;
            await setDoc(doc(db, "users", uid), { profileUrl: url }, { merge: true });
            setUser(prev => ({ ...prev, profileUrl: url }));
            setIsLoading(false);
            return true;
        } catch (e) {
            setIsLoading(false);
            return false;
        }
    };

    const updateUserInfo = async (data) => {
        if (!user || (!user.uid && !user.userId)) return false;
        setIsLoading(true);
        try {
            const uid = user.uid || user.userId;
            await setDoc(doc(db, "users", uid), data, { merge: true });
            setUser(prev => ({ ...prev, ...data }));
            setIsLoading(false);
            return { success: true };
        } catch (e) {
            setIsLoading(false);
            return { success: false, msg: e.message };
        }
    };

    const changeUserPassword = async (newPassword) => {
        setIsLoading(true);
        try {
            if (auth.currentUser) {
                await updatePassword(auth.currentUser, newPassword);
                setIsLoading(false);
                return { success: true };
            }
            throw new Error("Kullanıcı oturumu bulunamadı.");
        } catch (e) {
            setIsLoading(false);
            return { success: false, msg: e.message };
        }
    };

    const deleteUserAccount = async () => {
        setIsLoading(true);
        try {
            if (auth.currentUser) {
                const uid = auth.currentUser.uid;
                await deleteDoc(doc(db, "users", uid));
                await deleteUser(auth.currentUser);
                setIsLoading(false);
                return { success: true };
            }
            throw new Error("Kullanıcı oturumu bulunamadı.");
        } catch (e) {
            setIsLoading(false);
            return { success: false, msg: e.message };
        }
    };

    const resetPassword = async (email) => {
        setIsLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setIsLoading(false);
            return { success: true };
        } catch (e) {
            let msg = e.message || String(e);
            if (msg.includes('auth/invalid-email')) msg = 'Geçersiz e-posta adresi.';
            else if (msg.includes('auth/user-not-found')) msg = 'Bu e-posta adresine kayıtlı kullanıcı bulunamadı.';
            else msg = 'Şifre sıfırlama e-postası gönderilemedi.';
            setIsLoading(false);
            return { success: false, msg };
        }
    };

    const register = async (email, password, username, profileUrl) => {
        setIsLoading(true);
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, "users", response.user.uid), {
                username,
                profileUrl: profileUrl || 'https://cvhrma.org/wp-content/uploads/2015/07/default-profile-photo.jpg',
                userId: response.user.uid,
                email,
                createdAt: serverTimestamp(),
                favoritesCount: 0,
                commentCount: 0
            });
            setIsLoading(false);
            return { success: true, data: response?.user };
        } catch (e) {
            let msg = e.message || String(e);
            if (msg.includes('auth/invalid-email')) msg = 'Geçersiz e-posta adresi.';
            else if (msg.includes('auth/email-already-in-use')) msg = 'Bu e-posta adresi zaten kullanımda.';
            else if (msg.includes('auth/weak-password')) msg = 'Şifre çok zayıf (En az 6 karakter olmalı).';
            else msg = 'Kayıt işlemi başarısız oldu.';
            setIsLoading(false);
            return { success: false, msg };
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, updateProfileUrl, updateUserInfo, changeUserPassword, deleteUserAccount, resetPassword }}>
            {children}
        </AuthContext.Provider>
    );
};