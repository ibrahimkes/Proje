import { db } from '../../firebaseConfig';
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, increment, deleteDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
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
    } catch(e) {
        console.error("Error fetching places", e);
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
    } catch(e) {
        console.error("Error fetching place details", e);
        return null;
    }
}

export const getPlaceComments = async (placeId) => {
    try {
        const commentsSnap = await getDocs(collection(db, `places/${placeId}/comments`));
        return commentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch(e) {
        console.error("Error fetching comments", e);
        return [];
    }
}

export const addCommentToPlace = async (placeId, userId, userFullName, rating, text) => {
     try {
         const newCommentRef = doc(collection(db, `places/${placeId}/comments`));
         const commentData = {
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

         return { success: true, id: newCommentRef.id };
     } catch (e) {
         console.error("Error adding comment", e);
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
    } catch(e) {
         console.error("Error fetching user comments", e);
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
            if(pDetail) places.push(pDetail);
        }
        return places;
    } catch(e) {
        console.error("Error fetching favorites", e);
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
    } catch(e) {
        console.error("Error toggling favorite", e);
        return isCurrentlyFavorited; // if errors, assume unchanged
    }
}

export const isPlaceFavorited = async (userId, placeId) => {
    try {
        const favRef = doc(db, `users/${userId}/favorites`, placeId);
        const snap = await getDoc(favRef);
        return snap.exists();
    } catch(e) {
        return false;
    }
}


// SEEDER
const seedData = async () => {
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
         console.error("Error seeding data to Firestore", e);
    }
}
