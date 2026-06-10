import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { useAuth } from '../context/authContext';
import { getUserFavorites, getRecommendedPlaces } from '../services/firebaseService';
import { useLoading } from '../context/loadingContext';

const SavedScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [savedPlaces, setSavedPlaces] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const { setIsLoading } = useLoading();

    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            const fetchData = async () => {
                if (user) {
                    setIsLoading(true);
                    try {
                        const favs = await getUserFavorites(user.userId);
                        const recs = await getRecommendedPlaces(user.userId);
                        if (isActive) {
                            setSavedPlaces(favs);
                            setRecommendations(recs);
                        }
                    } catch (error) {
                        console.log("Error fetching data:", error);
                    } finally {
                        if (isActive) setIsLoading(false);
                    }
                }
            };
            fetchData();
            return () => { isActive = false; };
        }, [user])
    );

    const handlePlacePress = (place) => {
        navigation.navigate('Keşfet', { focusedPlace: place });
    };

    const renderRecommendation = ({ item }) => (
        <TouchableOpacity style={styles.recCard} onPress={() => handlePlacePress(item)}>
            <Image source={{ uri: item.image }} style={styles.recImage} />
            <View style={styles.recBadge}>
                <MaterialIcons name="auto-awesome" size={14} color="#FFF" />
                <Text style={styles.recBadgeText}>AI Önerisi</Text>
            </View>
            <View style={styles.recInfo}>
                <Text style={styles.recTitle} numberOfLines={1}>{item.title}</Text>
                <View style={styles.savedRating}>
                    <MaterialIcons name="star" size={14} color="#FFD700" />
                    <Text style={styles.savedRatingText}>{item.rating}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const ListEmpty = () => (
        <View style={styles.centerContainer}>
            <MaterialIcons name="bookmark-border" size={64} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>Henüz kaydedilmiş bir mekan yok.</Text>
        </View>
    );

    const ListFooter = () => {
        if (recommendations.length === 0) return null;
        return (
            <View style={styles.recContainer}>
                <Text style={styles.recSectionTitle}>Sizin İçin Önerilenler</Text>
                <Text style={styles.recSectionSubtitle}>Yapay zeka analizine dayalı kişiselleştirilmiş öneriler</Text>
                <FlatList
                    data={recommendations}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    renderItem={renderRecommendation}
                    contentContainerStyle={{ paddingVertical: 10 }}
                />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Kaydedilenler</Text>
            </View>
            <FlatList
                data={savedPlaces}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[styles.listContainer, savedPlaces.length === 0 && { flex: 1 }]}
                ListEmptyComponent={ListEmpty}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.savedCard} onPress={() => handlePlacePress(item)}>
                        <Image source={{ uri: item.image }} style={styles.savedImage} />
                        <View style={styles.savedInfo}>
                            <Text style={styles.savedTitle}>{item.title}</Text>
                            <Text style={styles.savedType}>{item.categories ? item.categories[0] : 'Mekan'}</Text>
                            <View style={styles.savedRating}>
                                <MaterialIcons name="star" size={16} color="#FFD700" />
                                <Text style={styles.savedRatingText}>{item.rating}</Text>
                            </View>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                )}
            />
            <ListFooter />
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
    recContainer: {
        marginTop: 20,
        paddingTop: 20,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    recSectionTitle: {
        ...theme.typography.h2,
        color: theme.colors.primary,
        marginBottom: 4,
    },
    recSectionSubtitle: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        marginBottom: 12,
    },
    recCard: {
        width: 160,
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.lg,
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        overflow: 'hidden',
    },
    recImage: {
        width: '100%',
        height: 110,
    },
    recInfo: {
        padding: 12,
    },
    recTitle: {
        ...theme.typography.body,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    recBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: theme.colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 8,
    },
    recBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
        marginLeft: 4,
    },
});

export default SavedScreen;
