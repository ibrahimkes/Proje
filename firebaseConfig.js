// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC_c_wvk33EkWRHc57cAvSGUSNwrRkXmHw",
    authDomain: "yore-kesfet-app.firebaseapp.com",
    projectId: "yore-kesfet-app",
    storageBucket: "yore-kesfet-app.firebasestorage.app",
    messagingSenderId: "561079006238",
    appId: "1:561079006238:web:fef698aefc0e5a5a9e6a0f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

import { getFirestore, collection } from "firebase/firestore";
export const db = getFirestore(app);

export const usersRef = collection(db, "users");
export const roomsRef = collection(db, "rooms");
