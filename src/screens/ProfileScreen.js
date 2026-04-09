import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, FlatList, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { useAuth } from '../context/authContext';
import { getUserFavorites, getUserComments } from '../services/firebaseService';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { log } from 'firebase/firestore/pipelines';

const AVATARS = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'
];

const ProfileScreen = ({ navigation }) => {
    const { user, logout, updateProfileUrl } = useAuth();
    const [savedPlaces, setSavedPlaces] = useState([]);
    const [userComments, setUserComments] = useState([]);
    const [isAvatarModalVisible, setAvatarModalVisible] = useState(false);

    const handleAvatarSelect = async (avatar) => {
        setAvatarModalVisible(false);
        await updateProfileUrl(avatar);
    };

    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            const fetchProfileData = async () => {
                if (user) {
                    const favs = await getUserFavorites(user.userId);
                    const comments = await getUserComments(user.userId);
                    if (isActive) {
                        setSavedPlaces(favs);
                        setUserComments(comments);
                    }
                }
            };
            fetchProfileData();
            return () => { isActive = false; };
        }, [user])
    );

    const handleLogout = async () => {
        await logout();
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.avatarWrapper} onPress={() => setAvatarModalVisible(true)} activeOpacity={0.8}>
                    <Image
                        source={{ uri: user?.profileUrl || AVATARS[0] }}
                        style={styles.avatar}
                    />
                    <View style={styles.editBadge}>
                        <MaterialIcons name="edit" size={16} color={theme.colors.card} />
                    </View>
                </TouchableOpacity>

                <Text style={styles.name}>{user?.username || 'Kullanıcı'}</Text>
                <Text style={styles.email}>{user?.email || 'email@yok.com'}</Text>

                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{savedPlaces.length || 0}</Text>
                        <Text style={styles.statLabel}>Kaydedilenler</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{userComments.length || 0}</Text>
                        <Text style={styles.statLabel}>Yorumlar</Text>
                    </View>
                </View>
            </View>

            <View style={styles.content}>
                {userComments.length > 0 && (
                     <>
                        <Text style={styles.sectionTitle}>Yorumlarım</Text>
                        <View style={styles.commentList}>
                            {userComments.map(comment => (
                                <View key={comment.id} style={styles.commentCard}>
                                    <View style={styles.commentHeader}>
                                         <Text style={styles.commentPlaceTitle}>{comment.placeTitle || 'Mekan'}</Text>
                                         <View style={styles.commentRating}>
                                             {[...Array(5)].map((_, i) => (
                                                 <MaterialIcons key={i} name="star" size={14} color={i < comment.rating ? "#FFD700" : theme.colors.border} />
                                             ))}
                                         </View>
                                    </View>
                                    <Text style={styles.commentText}>{comment.text}</Text>
                                    <Text style={styles.commentDate}>{comment.date}</Text>
                                </View>
                            ))}
                        </View>
                     </>
                )}

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

            {/* Avatar Select Modal */}
            <Modal
                visible={isAvatarModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setAvatarModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalBackdrop} onPress={() => setAvatarModalVisible(false)} />
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Profil Resmi Seç</Text>
                            <TouchableOpacity onPress={() => setAvatarModalVisible(false)}>
                                <MaterialIcons name="close" size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.avatarGrid}>
                            {AVATARS.map((avatar, index) => {
                                const isSelected = (user?.profileUrl || AVATARS[0]) === avatar;
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => handleAvatarSelect(avatar)}
                                        style={[
                                            styles.avatarGridItem,
                                            isSelected && styles.avatarGridItemSelected
                                        ]}
                                    >
                                        <Image source={{ uri: avatar }} style={styles.avatarGridImage} />
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </View>
            </Modal>
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
    avatarWrapper: {
        position: 'relative',
        marginBottom: 20,
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 3,
        borderColor: theme.colors.primary,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: theme.colors.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.card,
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
    commentList: {
        marginBottom: 24,
    },
    commentCard: {
        backgroundColor: theme.colors.card,
        padding: 16,
        borderRadius: theme.borderRadius.md,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    commentPlaceTitle: {
        ...theme.typography.body,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    commentRating: {
        flexDirection: 'row',
    },
    commentText: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        marginBottom: 8,
    },
    commentDate: {
        ...theme.typography.caption,
        color: theme.colors.border,
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
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '85%',
        backgroundColor: theme.colors.background,
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        ...theme.typography.h2,
    },
    avatarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
    },
    avatarGridItem: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 3,
        borderColor: 'transparent',
    },
    avatarGridItemSelected: {
        borderColor: theme.colors.primary,
    },
    avatarGridImage: {
        width: '100%',
        height: '100%',
        borderRadius: 30,
    }
});

export default ProfileScreen;
