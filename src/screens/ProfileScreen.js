import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

const AVATARS = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'
];

const ProfileScreen = ({ navigation }) => {
    const savedPlaces = [
        { id: '1', title: 'Antakya Sofrası', type: 'Hatay Yöresel', rating: 4.8 },
        { id: '2', title: 'İmam Çağdaş', type: 'Kebap ve Baklava', rating: 4.9 },
    ];

    const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);

    const handleLogout = () => {
        navigation.replace('Login');
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Image
                        source={{ uri: selectedAvatar }}
                        style={styles.avatar}
                    />
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.avatarSelectionContainer} contentContainerStyle={{ paddingHorizontal: 20 }}>
                    {AVATARS.map((avatar, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => setSelectedAvatar(avatar)}
                            style={[
                                styles.avatarChoice,
                                selectedAvatar === avatar && styles.avatarChoiceSelected
                            ]}
                        >
                            <Image source={{ uri: avatar }} style={styles.avatarChoiceImage} />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                <Text style={styles.name}>Ahmet Yılmaz</Text>
                <Text style={styles.email}>ahmet.y@email.com</Text>

                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>12</Text>
                        <Text style={styles.statLabel}>Kaydedilenler</Text>
                    </View>
                </View>
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Kaydedilen Mekanlar</Text>
                <View style={styles.savedList}>
                    {savedPlaces.map(place => (
                        <TouchableOpacity key={place.id} style={styles.savedCard}>
                            <View style={styles.savedIcon}>
                                <MaterialIcons name="bookmark" size={24} color={theme.colors.primary} />
                            </View>
                            <View style={styles.savedInfo}>
                                <Text style={styles.savedTitle}>{place.title}</Text>
                                <Text style={styles.savedType}>{place.type}</Text>
                            </View>
                            <View style={styles.savedRating}>
                                <MaterialIcons name="star" size={16} color="#FFD700" />
                                <Text style={styles.savedRatingText}>{place.rating}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>Ayarlar</Text>
                <View style={styles.settingsGroup}>
                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingIconBox}>
                            <MaterialIcons name="person-outline" size={24} color={theme.colors.text} />
                        </View>
                        <Text style={styles.settingText}>Hesap Bilgileri</Text>
                        <MaterialIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingIconBox}>
                            <MaterialIcons name="privacy-tip" size={24} color={theme.colors.text} />
                        </View>
                        <Text style={styles.settingText}>Gizlilik ve Güvenlik</Text>
                        <MaterialIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <MaterialIcons name="logout" size={24} color={theme.colors.primary} style={{ marginRight: 10 }} />
                    <Text style={styles.logoutText}>Çıkış Yap</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        backgroundColor: theme.colors.card,
        paddingTop: 60,
        paddingBottom: 30,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarSelectionContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    avatarChoice: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    avatarChoiceSelected: {
        borderColor: theme.colors.primary,
        transform: [{ scale: 1.1 }],
    },
    avatarChoiceImage: {
        width: '100%',
        height: '100%',
        borderRadius: 25,
    },
    name: {
        ...theme.typography.h1,
        marginBottom: 4,
    },
    email: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        marginBottom: 24,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 20,
    },
    statBox: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    statNumber: {
        ...theme.typography.h2,
        color: theme.colors.primary,
    },
    statLabel: {
        ...theme.typography.caption,
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: theme.colors.border,
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        ...theme.typography.h2,
        marginTop: 10,
        marginBottom: 16,
    },
    savedList: {
        marginBottom: 24,
    },
    savedCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        padding: 16,
        borderRadius: theme.borderRadius.md,
        marginBottom: 12,
    },
    savedIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(240, 138, 36, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
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
    },
    savedRating: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    savedRatingText: {
        ...theme.typography.caption,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    settingsGroup: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.md,
        overflow: 'hidden',
        marginBottom: 30,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.background,
    },
    settingIconBox: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    settingText: {
        flex: 1,
        ...theme.typography.body,
        fontWeight: '500',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        marginBottom: 40,
    },
    logoutText: {
        ...theme.typography.h3,
        color: theme.colors.primary,
    }
});

export default ProfileScreen;
