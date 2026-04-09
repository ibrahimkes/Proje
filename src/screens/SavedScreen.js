import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { useAuth } from '../context/authContext';
import { getUserFavorites } from '../services/firebaseService';

const SavedScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [savedPlaces, setSavedPlaces] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            const fetchFavorites = async () => {
                if (user) {
                    setLoading(true);
                    const favs = await getUserFavorites(user.userId);
                    if (isActive) {
                        setSavedPlaces(favs);
                        setLoading(false);
                    }
                }
            };
            fetchFavorites();
            return () => { isActive = false; };
        }, [user])
    );

    const handlePlacePress = (place) => {
        // Navigate to MapScreen and focus on this place
        navigation.navigate('Keşfet', { focusedPlace: place });
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (savedPlaces.length === 0) {
         return (
             <View style={styles.centerContainer}>
                 <MaterialIcons name="bookmark-border" size={64} color={theme.colors.textSecondary} />
                 <Text style={styles.emptyText}>Henüz kaydedilmiş bir mekan yok.</Text>
             </View>
         )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Kaydedilenler</Text>
            </View>
            <FlatList
                data={savedPlaces}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.savedCard} onPress={() => handlePlacePress(item)}>
                        <Image source={{ uri: item.image }} style={styles.savedImage} />
                        <View style={styles.savedInfo}>
                            <Text style={styles.savedTitle}>{item.title}</Text>
                            <Text style={styles.savedType}>{item.subtitle || item.type || 'Mekan'}</Text>
                            <View style={styles.savedRating}>
                                <MaterialIcons name="star" size={16} color="#FFD700" />
                                <Text style={styles.savedRatingText}>{item.rating}</Text>
                            </View>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    emptyText: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        marginTop: 16,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: theme.colors.card,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerTitle: {
        ...theme.typography.h1,
    },
    listContainer: {
        padding: 20,
    },
    savedCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        padding: 12,
        borderRadius: theme.borderRadius.md,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    savedImage: {
        width: 70,
        height: 70,
        borderRadius: 10,
        marginRight: 16,
    },
    savedInfo: {
        flex: 1,
    },
    savedTitle: {
        ...theme.typography.h3,
        marginBottom: 4,
    },
    savedType: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        marginBottom: 8,
    },
    savedRating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    savedRatingText: {
        ...theme.typography.caption,
        fontWeight: 'bold',
        marginLeft: 4,
    },
});

export default SavedScreen;
