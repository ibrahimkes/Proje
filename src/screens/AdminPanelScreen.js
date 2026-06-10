import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Image, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { getPlaces, addPlace, updatePlace, deletePlace } from '../services/firebaseService';
import { useLoading } from '../context/loadingContext';
import { useFocusEffect } from '@react-navigation/native';

const AdminPanelScreen = () => {
    const [places, setPlaces] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPlaceId, setCurrentPlaceId] = useState(null);
    const { setIsLoading } = useLoading();
    
    // Form States
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [previewImage, setPreviewImage] = useState('');

    useFocusEffect(
        React.useCallback(() => {
            loadPlaces();
        }, [])
    );

    const loadPlaces = async () => {
        setIsLoading(true);
        const data = await getPlaces();
        setPlaces(data);
        setIsLoading(false);
    };

    const handleAddPlace = () => {
        setIsEditing(false);
        setCurrentPlaceId(null);
        setTitle('');
        setSubtitle('');
        setDescription('');
        setImage('');
        setLatitude('');
        setLongitude('');
        setPreviewImage('');
        setIsModalVisible(true);
    };

    const handleEditPlace = (place) => {
        setIsEditing(true);
        setCurrentPlaceId(place.id);
        setTitle(place.title || '');
        setSubtitle(place.subtitle || '');
        setDescription(place.description || '');
        setImage(place.image || '');
        setLatitude(place.coordinate?.latitude?.toString() || '');
        setLongitude(place.coordinate?.longitude?.toString() || '');
        setPreviewImage(place.image || '');
        setIsModalVisible(true);
    };

    const handleDeletePlace = (placeId) => {
        Alert.alert(
            "Silme Onayı",
            "Bu mekanı silmek istediğinize emin misiniz?",
            [
                { text: "İptal", style: "cancel" },
                { 
                    text: "Sil", 
                    style: "destructive",
                    onPress: async () => {
                        setIsLoading(true);
                        const res = await deletePlace(placeId);
                        if(res.success) {
                            Alert.alert("Başarılı", "Mekan silindi.");
                            loadPlaces();
                        } else {
                            Alert.alert("Hata", "Mekan silinirken bir hata oluştu.");
                        }
                        setIsLoading(false);
                    }
                }
            ]
        );
    };

    const handleSave = async () => {
        if(!title || !latitude || !longitude || !image) {
            Alert.alert("Uyarı", "Lütfen başlık, enlem, boylam ve resim linki alanlarını doldurun.");
            return;
        }

        const placeData = {
            title,
            subtitle,
            description,
            image,
            rating: isEditing ? undefined : 0, // only set rating to 0 if new
            categories: ["all"],
            coordinate: {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude)
            }
        };

        if (isEditing) {
            delete placeData.rating; // Don't overwrite existing rating
        }

        setIsLoading(true);
        let res;
        if(isEditing) {
            res = await updatePlace(currentPlaceId, placeData);
        } else {
            res = await addPlace(placeData);
        }
        setIsLoading(false);

        if(res.success) {
            Alert.alert("Başarılı", isEditing ? "Mekan güncellendi." : "Yeni mekan eklendi.");
            setIsModalVisible(false);
            loadPlaces();
        } else {
            Alert.alert("Hata", "İşlem sırasında bir hata oluştu.");
        }
    };

    const renderPlaceItem = ({ item }) => (
        <View style={styles.placeCard}>
            <Image source={{ uri: item.image }} style={styles.placeImage} />
            <View style={styles.placeInfo}>
                <Text style={styles.placeTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.placeSubtitle} numberOfLines={1}>{item.subtitle}</Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleEditPlace(item)}>
                    <MaterialIcons name="edit" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeletePlace(item.id)}>
                    <MaterialIcons name="delete" size={24} color={theme.colors.error} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const filteredPlaces = places.filter(place => 
        place.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Admin Paneli</Text>
            </View>

            <View style={styles.searchContainer}>
                <MaterialIcons name="search" size={24} color={theme.colors.textSecondary} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Mekan ara..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={theme.colors.textSecondary}
                />
                {searchQuery ? (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <MaterialIcons name="close" size={24} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                ) : null}
            </View>

            <FlatList 
                data={filteredPlaces}
                keyExtractor={item => item.id}
                renderItem={renderPlaceItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity style={styles.fab} onPress={handleAddPlace}>
                <MaterialIcons name="add" size={30} color={theme.colors.card} />
            </TouchableOpacity>

            <Modal visible={isModalVisible} animationType="slide" presentationStyle="pageSheet">
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{isEditing ? "Mekanı Güncelle" : "Yeni Mekan Ekle"}</Text>
                        <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                            <MaterialIcons name="close" size={28} color={theme.colors.text} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: 40 }}>
                        
                        <Text style={styles.label}>Başlık *</Text>
                        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Mekan Başlığı" />

                        <Text style={styles.label}>Alt Başlık</Text>
                        <TextInput style={styles.input} value={subtitle} onChangeText={setSubtitle} placeholder="Mekan Alt Başlığı (örn. Yöresel Lezzet)" />

                        <Text style={styles.label}>Açıklama</Text>
                        <TextInput style={[styles.input, { height: 80 }]} value={description} onChangeText={setDescription} placeholder="Detaylı açıklama" multiline />

                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                                <Text style={styles.label}>Enlem (Latitude) *</Text>
                                <TextInput style={styles.input} value={latitude} onChangeText={setLatitude} placeholder="37.0667" keyboardType="numeric" />
                            </View>
                            <View style={{ flex: 1, marginLeft: 8 }}>
                                <Text style={styles.label}>Boylam (Longitude) *</Text>
                                <TextInput style={styles.input} value={longitude} onChangeText={setLongitude} placeholder="37.3833" keyboardType="numeric" />
                            </View>
                        </View>

                        <Text style={styles.label}>Resim URL *</Text>
                        <View style={styles.imageInputRow}>
                            <TextInput 
                                style={[styles.input, { flex: 1, marginBottom: 0 }]} 
                                value={image} 
                                onChangeText={setImage} 
                                placeholder="https://..." 
                                autoCapitalize="none"
                            />
                            <TouchableOpacity style={styles.checkBtn} onPress={() => setPreviewImage(image)}>
                                <Text style={styles.checkBtnText}>Kontrol Et</Text>
                            </TouchableOpacity>
                        </View>

                        {previewImage ? (
                            <View style={styles.previewContainer}>
                                <Text style={styles.previewText}>Resim Önizleme:</Text>
                                <Image 
                                    source={{ uri: previewImage }} 
                                    style={styles.previewImage} 
                                    resizeMode="cover"
                                    onError={() => {
                                        Alert.alert("Hata", "Resim yüklenemedi. Lütfen linki kontrol edin.");
                                        setPreviewImage('');
                                    }}
                                />
                            </View>
                        ) : null}

                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                            <Text style={styles.saveBtnText}>Kaydet</Text>
                        </TouchableOpacity>

                    </ScrollView>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: theme.colors.card,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        marginBottom: 10,
    },
    headerTitle: {
        ...theme.typography.h1,
        color: theme.colors.text,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        marginHorizontal: 20,
        marginBottom: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: theme.colors.text,
    },
    listContent: {
        padding: 20,
        paddingBottom: 100,
    },
    placeCard: {
        flexDirection: 'row',
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.md,
        padding: 12,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    placeImage: {
        width: 60,
        height: 60,
        borderRadius: theme.borderRadius.sm,
    },
    placeInfo: {
        flex: 1,
        marginLeft: 12,
        marginRight: 8,
    },
    placeTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
    },
    placeSubtitle: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    actions: {
        flexDirection: 'row',
    },
    actionBtn: {
        padding: 8,
        marginLeft: 4,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 30,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.card,
    },
    modalTitle: {
        ...theme.typography.h2,
    },
    modalBody: {
        flex: 1,
        padding: 20,
        backgroundColor: theme.colors.background,
    },
    label: {
        ...theme.typography.body,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        padding: 12,
        fontSize: 16,
        color: theme.colors.text,
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
    },
    imageInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkBtn: {
        backgroundColor: theme.colors.secondary,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: theme.borderRadius.md,
        marginLeft: 8,
    },
    checkBtnText: {
        color: theme.colors.card,
        fontWeight: 'bold',
    },
    previewContainer: {
        marginTop: 16,
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        padding: 12,
        borderRadius: theme.borderRadius.md,
    },
    previewText: {
        ...theme.typography.caption,
        marginBottom: 8,
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: theme.borderRadius.sm,
    },
    saveBtn: {
        backgroundColor: theme.colors.primary,
        padding: 16,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        marginTop: 30,
    },
    saveBtnText: {
        color: theme.colors.card,
        ...theme.typography.h3,
    }
});

export default AdminPanelScreen;
