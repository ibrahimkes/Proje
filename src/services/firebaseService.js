import { db, functions } from '../../firebaseConfig';
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, increment, deleteDoc, serverTimestamp, writeBatch, query, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { MOCK_MARKERS } from '../constants/mockData';

// PLACES
export const getPlaces = async () => {
    try {
        const placesSnapshot = await getDocs(collection(db, "places"));
        if (placesSnapshot.empty) {
            console.log("No places found, seeding data...");
            await seedData();
            const newSnap = await getDocs(collection(db, "places"));
            return newSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
        return placesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.log("Error fetching places", e);
        return [];
    }
};

// Haversine formula to calculate distance between two coordinates in km
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

export const getNearbyPlaces = async (userLat, userLon, radiusKm = 10) => {
    try {
        // Approximate 1 degree of latitude to ~111 km
        const latDelta = radiusKm / 111;
        const minLat = userLat - latDelta;
        const maxLat = userLat + latDelta;

        const placesRef = collection(db, "places");
        const q = query(
            placesRef,
            where("coordinate.latitude", ">=", minLat),
            where("coordinate.latitude", "<=", maxLat)
        );

        const placesSnapshot = await getDocs(q);
        
        const nearbyPlaces = [];
        placesSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.coordinate && data.coordinate.latitude && data.coordinate.longitude) {
                const dist = calculateDistance(userLat, userLon, data.coordinate.latitude, data.coordinate.longitude);
                if (dist <= radiusKm) {
                    nearbyPlaces.push({ id: doc.id, ...data, distance: dist });
                }
            }
        });

        // Sort by distance (closest first)
        return nearbyPlaces.sort((a, b) => a.distance - b.distance);
    } catch (e) {
        console.log("Error fetching nearby places", e);
        return [];
    }
};

export const getPlaceDetail = async (placeId) => {
    try {
        const docSnap = await getDoc(doc(db, "places", placeId));
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (e) {
        console.log("Error fetching place details", e);
        return null;
    }
}

export const addPlace = async (placeData) => {
    try {
        const newPlaceRef = doc(collection(db, "places"));
        const newPlace = { ...placeData, id: newPlaceRef.id, createdAt: serverTimestamp() };
        await setDoc(newPlaceRef, newPlace);
        return { success: true, id: newPlaceRef.id };
    } catch (e) {
        console.log("Error adding place", e);
        return { success: false, error: e };
    }
};

export const updatePlace = async (placeId, placeData) => {
    try {
        const placeRef = doc(db, "places", placeId);
        await updateDoc(placeRef, { ...placeData, updatedAt: serverTimestamp() });
        return { success: true };
    } catch (e) {
        console.log("Error updating place", e);
        return { success: false, error: e };
    }
};

export const deletePlace = async (placeId) => {
    try {
        // First delete all comments related to this place
        const commentsSnap = await getDocs(collection(db, `places/${placeId}/comments`));
        if (!commentsSnap.empty) {
            const batch = writeBatch(db);
            commentsSnap.forEach(docSnap => {
                batch.delete(docSnap.ref);
            });
            await batch.commit();
        }
        
        // Delete the place itself
        await deleteDoc(doc(db, "places", placeId));
        return { success: true };
    } catch (e) {
        console.log("Error deleting place", e);
        return { success: false, error: e };
    }
};

export const getPlaceComments = async (placeId) => {
    try {
        const commentsSnap = await getDocs(collection(db, `places/${placeId}/comments`));
        return commentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.log("Error fetching comments", e);
        return [];
    }
}

export const addCommentToPlace = async (placeId, userId, userFullName, rating, text) => {
    try {
        const newCommentRef = doc(collection(db, `places/${placeId}/comments`));
        const commentData = {
            id: newCommentRef.id,
            userId,
            user: userFullName,
            rating,
            text,
            date: new Date().toLocaleDateString('tr-TR'),
            createdAt: serverTimestamp(),
            placeId,
        };

        await setDoc(newCommentRef, commentData);

        // Also save to user's comments for easy access
        const userCommentRef = doc(db, `users/${userId}/comments`, newCommentRef.id);
        await setDoc(userCommentRef, commentData);

        // Increment comment count on user
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            commentCount: increment(1)
        });

        // Calculate average rating
        const commentsSnap = await getDocs(collection(db, `places/${placeId}/comments`));
        let totalRating = 0;
        commentsSnap.forEach(doc => {
            totalRating += (doc.data().rating || 0);
        });
        const avg = commentsSnap.size > 0 ? (totalRating / commentsSnap.size) : 0;
        const newAverage = Number(avg.toFixed(1));

        // Update place document
        await updateDoc(doc(db, "places", placeId), {
            rating: newAverage
        });

        return { success: true, id: newCommentRef.id, newAverage };
    } catch (e) {
        console.log("Error adding comment", e);
        return { success: false, error: e };
    }
}

// COMMENTS / USERS
export const getUserComments = async (userId) => {
    try {
        const commentsSnap = await getDocs(collection(db, `users/${userId}/comments`));
        const comments = commentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Let's attach placeDetail specifically for titles if needed
        for (let i = 0; i < comments.length; i++) {
            const pd = await getPlaceDetail(comments[i].placeId);
            if (pd) comments[i].placeTitle = pd.title;
        }
        return comments;
    } catch (e) {
        console.log("Error fetching user comments", e);
        return [];
    }
}

// FAVORITES
export const getUserFavorites = async (userId) => {
    try {
        const favsSnap = await getDocs(collection(db, `users/${userId}/favorites`));
        const favIds = favsSnap.docs.map(doc => doc.id);

        // Fetch place details for these ids
        const places = [];
        for (const pid of favIds) {
            const pDetail = await getPlaceDetail(pid);
            if (pDetail) places.push(pDetail);
        }
        return places;
    } catch (e) {
        console.log("Error fetching favorites", e);
        return [];
    }
}

export const toggleFavorite = async (userId, placeId, isCurrentlyFavorited) => {
    try {
        const favRef = doc(db, `users/${userId}/favorites`, placeId);
        const userRef = doc(db, "users", userId);

        if (isCurrentlyFavorited) {
            await deleteDoc(favRef);
            await updateDoc(userRef, { favoritesCount: increment(-1) });
            return false; // new state
        } else {
            await setDoc(favRef, { addedAt: serverTimestamp() });
            await updateDoc(userRef, { favoritesCount: increment(1) });
            return true; // new state
        }
    } catch (e) {
        console.log("Error toggling favorite", e);
        return isCurrentlyFavorited; // if errors, assume unchanged
    }
}

export const isPlaceFavorited = async (userId, placeId) => {
    try {
        const favRef = doc(db, `users/${userId}/favorites`, placeId);
        const snap = await getDoc(favRef);
        return snap.exists();
    } catch (e) {
        return false;
    }
}


// RECOMMENDATIONS (AI ML)
export const getRecommendedPlaces = async (userId) => {
    try {
        const recommendFn = httpsCallable(functions, 'recommend_places');
        const result = await recommendFn({ userId });
        if (result.data && result.data.recommendations) {
            return result.data.recommendations;
        }
        return [];
    } catch (e) {
        console.log("Error fetching recommendations from ML model:", e);
        return [];
    }
}

// SEEDER
export const seedData = async () => {
    try {
        const batch = writeBatch(db);

        for (const place of MOCK_MARKERS) {
            // Using ID string manually to keep consistency if we want
            const placeRef = doc(db, "places", place.id);
            const { comments, ...placeData } = place;
            batch.set(placeRef, placeData);

            // Subcollection for comments
            if (comments && comments.length > 0) {
                for (const comment of comments) {
                    const commentRef = doc(db, `places/${place.id}/comments`, comment.id);
                    batch.set(commentRef, comment);
                }
            }
        }

        await batch.commit();
        console.log("Mock data seeded into Firestore successfully.");
    } catch (e) {
        console.log("Error seeding data to Firestore", e);
    }
}
