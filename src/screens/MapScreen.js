import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import AlertWrapper from '../components/AlertWrapper';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { ANTEP_CENTER_COORDINATE, CATEGORIES } from '../constants/mockData';
import { getPlaces } from '../services/firebaseService';

const MapScreen = ({ route, navigation }) => {
    const mapRef = useRef(null);
    const [isAlertVisible, setIsAlertVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [markers, setMarkers] = useState([]);

    useEffect(() => {
        (async () => {
            const fetchedPlaces = await getPlaces();
            setMarkers(fetchedPlaces);
        })();
    }, []);

    useEffect(() => {
        if (route.params?.focusedPlace) {
            const place = route.params.focusedPlace;
            setSelectedPlace(place);
            setIsAlertVisible(true);
            mapRef.current?.animateToRegion({
                ...place.coordinate,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            }, 1000);
            
            navigation.setParams({ focusedPlace: null });
        }
    }, [route.params?.focusedPlace]);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setUserLocation(location.coords);

            Location.watchPositionAsync({
                accuracy: Location.Accuracy.High,
                timeInterval: 5000,
                distanceInterval: 10,
            }, (loc) => {
                setUserLocation(loc.coords);
            });
        })();
    }, []); const handleMarkerPress = (place) => {
        setSelectedPlace(place);
        setIsAlertVisible(true);
        // Animate map to marker
        mapRef.current?.animateToRegion({
            ...place.coordinate,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        }, 1000);
    };
    console.log(selectedPlace);
    const closeAlert = useCallback(() => {
        setIsAlertVisible(false);
        setTimeout(() => setSelectedPlace(null), 300); // Wait for close animation
    }, []);

    const renderCategory = ({ item }) => {
        const isSelected = selectedCategory === item.id;
        return (
            <TouchableOpacity
                style={[styles.categoryPill, isSelected && styles.categoryPillSelected]}
                onPress={() => setSelectedCategory(item.id)}
            >
                {item.icon && (
                    <MaterialIcons
                        name={item.icon}
                        size={16}
                        color={isSelected ? theme.colors.card : theme.colors.text}
                        style={{ marginRight: 6 }}
                    />
                )}
                <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
                    {item.title}
                </Text>
            </TouchableOpacity>
        );
    };

    const filteredMarkers = selectedCategory === 'all'
        ? markers
        : markers.filter(m => m.categories.map(c => c.toLowerCase()).includes(selectedCategory));

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    ...ANTEP_CENTER_COORDINATE,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                showsUserLocation={true}
                showsMyLocationButton={false}
            >

                {/* Place Markers */}
                {filteredMarkers.map(marker => (
                    <Marker
                        key={marker.id}
                        coordinate={marker.coordinate}
                        onPress={() => handleMarkerPress(marker)}
                    >
                        <View style={[styles.customMarker, selectedPlace?.id === marker.id && styles.customMarkerSelected]}>
                            <MaterialIcons
                                name="restaurant"
                                size={20}
                                color={selectedPlace?.id === marker.id ? theme.colors.card : theme.colors.primary}
                            />
                        </View>
                    </Marker>
                ))}
            </MapView>



            {/* Floating Action Buttons */}
            <View style={styles.fabContainer}>
                <TouchableOpacity style={styles.fab} onPress={() => {
                    if (userLocation) {
                        mapRef.current?.animateToRegion({
                            latitude: userLocation.latitude,
                            longitude: userLocation.longitude,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }, 1000);
                    } else {
                        mapRef.current?.animateToRegion({
                            ...ANTEP_CENTER_COORDINATE,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }, 1000);
                    }
                }}>
                    <MaterialIcons name="my-location" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Custom Alert Wrapper for Place Details */}
            <AlertWrapper
                isShow={isAlertVisible}
                close={closeAlert}
            >
                {selectedPlace && (
                    <View style={styles.sheetContent}>
                        <TouchableOpacity
                            style={styles.placeHeader}
                            onPress={() => {
                                closeAlert();
                                navigation.navigate('PlaceDetail', { place: selectedPlace });
                            }}
                            activeOpacity={0.7}
                        >
                            <Image source={{ uri: selectedPlace.image }} style={styles.placeImage} />
                            <View style={styles.placeInfo}>
                                <View style={styles.titleRow}>
                                    <Text style={styles.placeTitle}>{selectedPlace.title}</Text>
                                    <TouchableOpacity style={styles.iconButton}>
                                        <MaterialIcons name="share" size={24} color={theme.colors.text} />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.placeSubtitle}>{selectedPlace.subtitle}</Text>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.primaryButton} onPress={() => {
                                closeAlert();
                                navigation.navigate('PlaceDetail', { place: selectedPlace });
                            }}>
                                <MaterialIcons name="directions" size={20} color={theme.colors.card} style={{ marginRight: 8 }} />
                                <Text style={styles.primaryButtonText}>Detay ve Yorumlar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </AlertWrapper>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    topOverlay: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.round,
        paddingHorizontal: 16,
        height: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        ...theme.typography.body,
    },
    filterButton: {
        width: 50,
        height: 50,
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.round,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    categoriesContainer: {
        height: 40,
    },
    categoryList: {
        paddingRight: 20,
    },
    categoryPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: theme.borderRadius.round,
        marginRight: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    categoryPillSelected: {
        backgroundColor: theme.colors.text,
    },
    categoryText: {
        ...theme.typography.caption,
        fontWeight: '600',
        color: theme.colors.text,
    },
    categoryTextSelected: {
        color: theme.colors.card,
    },
    customMarker: {
        backgroundColor: theme.colors.card,
        padding: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    customMarkerSelected: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.card,
    },
    fabContainer: {
        position: 'absolute',
        right: 16,
        bottom: 30, // Adjust to stay above bottom tabs/sheet
    },
    fab: {
        width: 48,
        height: 48,
        backgroundColor: theme.colors.card,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    sheetContent: {
        flex: 1,
        paddingHorizontal: 20,
    },
    placeHeader: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    placeImage: {
        width: 80,
        height: 80,
        borderRadius: theme.borderRadius.sm,
        marginRight: 16,
    },
    placeInfo: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    placeTitle: {
        ...theme.typography.h3,
        flex: 1,
    },
    placeSubtitle: {
        ...theme.typography.caption,
        marginTop: 2,
    },
    placeMeta: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        marginTop: 6,
    },
    placeDistance: {
        ...theme.typography.caption,
        color: theme.colors.text,
        fontWeight: '600',
        marginTop: 4,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    primaryButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: theme.colors.primary,
        height: 48,
        borderRadius: theme.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    primaryButtonText: {
        color: theme.colors.card,
        fontWeight: 'bold',
        fontSize: 16,
    },
    iconButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    }
});

export default MapScreen;
