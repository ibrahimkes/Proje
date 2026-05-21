import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Linking } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import AlertWrapper from '../components/AlertWrapper';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { ANTEP_CENTER_COORDINATE, MOCK_MARKERS } from '../constants/mockData';
import { useLoading } from '../context/loadingContext';
import Constants from 'expo-constants';

const MapScreen = ({ route, navigation }) => {
    const mapRef = useRef(null);
    const [isAlertVisible, setIsAlertVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [locationPermission, setLocationPermission] = useState(null);
    const [routeDestination, setRouteDestination] = useState(null);
    const { setIsLoading } = useLoading();
    const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.googleMapsApiKey;

    useEffect(() => {
        if (locationPermission === 'granted') {
            setIsLoading(true);
            setMarkers(MOCK_MARKERS);
            setIsLoading(false);
        }
    }, [locationPermission]);

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

    const checkAndRequestLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            setLocationPermission(status);

            if (status !== 'granted') {
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
        } catch (error) {
            console.log("Konum hatası: ", error);
            setLocationPermission('denied');
        }
    };

    useEffect(() => {
        checkAndRequestLocation();
    }, []);

    const handleMarkerPress = (place) => {
        setSelectedPlace(place);
        setIsAlertVisible(true);
        mapRef.current?.animateToRegion({
            ...place.coordinate,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        }, 1000);
    };
    console.log(selectedPlace);

    const closeAlert = useCallback(() => {
        setIsAlertVisible(false);
        setTimeout(() => setSelectedPlace(null), 300);
    }, []);

    const startRoute = () => {
        if (!selectedPlace) return;
        setRouteDestination(selectedPlace.coordinate);
        closeAlert();
    };

    const getMarkerIcon = (categories) => {
        if (!categories) return "place";
        const catString = categories.join(' ').toLowerCase();

        if (catString.includes('kebap') || catString.includes('yemek') || catString.includes('meze') || catString.includes('baklava')) {
            return "restaurant";
        } else if (catString.includes('müze') || catString.includes('tarihi') || catString.includes('kale')) {
            return "museum";
        } else if (catString.includes('park') || catString.includes('doğa') || catString.includes('bahçe')) {
            return "park";
        } else if (catString.includes('kahve') || catString.includes('cafe')) {
            return "local-cafe";
        }

        return "place";
    };

    const filteredMarkers = selectedCategory === 'all'
        ? markers
        : markers.filter(m => m.categories.map(c => c.toLowerCase()).includes(selectedCategory));

    if (locationPermission === 'denied') {
        return (
            <View style={styles.permissionContainer}>
                <MaterialIcons name="location-off" size={64} color={theme.colors.primary} />
                <Text style={styles.permissionTitle}>Konum İzni Gerekli</Text>
                <Text style={styles.permissionText}>Haritayı ve mekanları görebilmek için konum erişimine izin vermeniz gerekmektedir.</Text>
                <TouchableOpacity style={styles.permissionButton} onPress={() => Linking.openSettings()}>
                    <Text style={styles.permissionButtonText}>Ayarlara Git</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.permissionRetryButton} onPress={checkAndRequestLocation}>
                    <Text style={styles.permissionRetryText}>Tekrar Dene</Text>
                </TouchableOpacity>
            </View>
        );
    }

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
                showsUserLocation={locationPermission === 'granted'}
                showsMyLocationButton={false}
            >

                {filteredMarkers.map(marker => (
                    <Marker
                        key={marker.id}
                        coordinate={marker.coordinate}
                        onPress={() => handleMarkerPress(marker)}
                    >
                        <View style={[styles.customMarker, selectedPlace?.id === marker.id && styles.customMarkerSelected]}>
                            <MaterialIcons
                                name={getMarkerIcon(marker.categories)}
                                size={20}
                                color={selectedPlace?.id === marker.id ? theme.colors.card : theme.colors.primary}
                            />
                        </View>
                    </Marker>
                ))}

                {routeDestination && userLocation && (
                    <MapViewDirections
                        origin={userLocation}
                        destination={routeDestination}
                        apikey={GOOGLE_MAPS_API_KEY}
                        strokeWidth={5}
                        strokeColor={theme.colors.primary}
                        language="tr"
                        onReady={(result) => {
                            mapRef.current?.fitToCoordinates(result.coordinates, {
                                edgePadding: {
                                    right: 50,
                                    bottom: 50,
                                    left: 50,
                                    top: 100,
                                },
                            });
                        }}
                    />
                )}
            </MapView>

            {routeDestination && (
                <View style={styles.cancelRouteContainer}>
                    <TouchableOpacity style={styles.cancelRouteButton} onPress={() => setRouteDestination(null)}>
                        <MaterialIcons name="close" size={24} color={theme.colors.card} style={{ marginRight: 8 }} />
                        <Text style={styles.cancelRouteText}>Rotayı İptal Et</Text>
                    </TouchableOpacity>
                </View>
            )}

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
                        checkAndRequestLocation();
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
                            <TouchableOpacity style={styles.secondaryButton} onPress={startRoute}>
                                <MaterialIcons name="directions" size={20} color={theme.colors.primary} style={{ marginRight: 4 }} />
                                <Text style={styles.secondaryButtonText}>Yol Tarifi</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.primaryButton} onPress={() => {
                                closeAlert();
                                navigation.navigate('PlaceDetail', { place: selectedPlace });
                            }}>
                                <MaterialIcons name="info-outline" size={20} color={theme.colors.card} style={{ marginRight: 4 }} />
                                <Text style={styles.primaryButtonText}>Detaylar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </AlertWrapper>
        </View>
    );
};

const styles = StyleSheet.create({
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        padding: 24,
    },
    permissionTitle: {
        ...theme.typography.h2,
        marginTop: 16,
        marginBottom: 8,
        color: theme.colors.text,
        textAlign: 'center',
    },
    permissionText: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: 32,
    },
    permissionButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: theme.borderRadius.md,
        width: '100%',
        alignItems: 'center',
        marginBottom: 12,
    },
    permissionButtonText: {
        ...theme.typography.h3,
        color: theme.colors.card,
    },
    permissionRetryButton: {
        paddingVertical: 12,
    },
    permissionRetryText: {
        ...theme.typography.body,
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
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
        bottom: 30,
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
        marginTop: 10,
    },
    secondaryButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: theme.colors.card,
        height: 44,
        borderRadius: theme.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    secondaryButtonText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        fontSize: 15,
    },
    primaryButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: theme.colors.primary,
        height: 44,
        borderRadius: theme.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    primaryButtonText: {
        color: theme.colors.card,
        fontWeight: 'bold',
        fontSize: 15,
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
    },
    cancelRouteContainer: {
        position: 'absolute',
        top: 60,
        alignSelf: 'center',
        zIndex: 100,
    },
    cancelRouteButton: {
        flexDirection: 'row',
        backgroundColor: theme.colors.text,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    cancelRouteText: {
        color: theme.colors.card,
        fontWeight: 'bold',
        fontSize: 15,
    }
});

export default MapScreen;
