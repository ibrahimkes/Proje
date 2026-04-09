import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Keyboard, Modal } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { useAuth } from '../context/authContext';
import { getPlaceComments, addCommentToPlace, isPlaceFavorited, toggleFavorite } from '../services/firebaseService';

const PlaceDetailScreen = ({ route, navigation }) => {
    const { place } = route.params || {};
    const [newComment, setNewComment] = useState('');
    const [newRating, setNewRating] = useState(5);
    const [isCommenting, setIsCommenting] = useState(false);
    const [comments, setComments] = useState([]);
    const [isFav, setIsFav] = useState(false);

    const { user } = useAuth();

    useEffect(() => {
        if (!place) return;
        (async () => {
            const fetchedComments = await getPlaceComments(place.id);
            setComments(fetchedComments);
            if (user) {
                const favStatus = await isPlaceFavorited(user.userId, place.id);
                setIsFav(favStatus);
            }
        })();
    }, [place, user]);

    const handleSendComment = async () => {
        if (!newComment.trim() || !user) return;
        Keyboard.dismiss();
        const response = await addCommentToPlace(place.id, user.userId, user.username, newRating, newComment.trim());
        if (response.success) {
            setComments([...comments, { id: response.id, text: newComment.trim(), user: user.username, rating: newRating, date: 'Şimdi' }]);
            setNewComment('');
            setNewRating(5);
            setIsCommenting(false);
        }
    };

    const handleToggleFav = async () => {
        if (!user) return;
        const newStatus = await toggleFavorite(user.userId, place.id, isFav);
        setIsFav(newStatus);
    };

    if (!place) return null;

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Cover Image & Header */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: place.image }} style={styles.coverImage} />
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={24} color={theme.colors.card} />
                    </TouchableOpacity>
                    <View style={styles.ratingBadge}>
                        <MaterialIcons name="star" size={16} color="#FFD700" style={{ marginRight: 4 }} />
                        <Text style={styles.ratingText}>{place.rating}</Text>
                    </View>
                </View>

                {/* Info Card */}
                <View style={styles.infoSection}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title}>{place.title}</Text>
                        <TouchableOpacity onPress={handleToggleFav}>
                            <MaterialIcons name={isFav ? "favorite" : "favorite-border"} size={28} color={isFav ? theme.colors.primary : theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.subtitle}>{place.subtitle}</Text>


                    <Text style={styles.sectionTitle}>Hakkında</Text>
                    <Text style={styles.description}>{place.description}</Text>

                    {place.coordinate && (
                        <>
                            <Text style={styles.sectionTitle}>Konum</Text>
                            <View style={styles.miniMapContainer}>
                                <MapView
                                    style={styles.miniMap}
                                    initialRegion={{
                                        ...place.coordinate,
                                        latitudeDelta: 0.005,
                                        longitudeDelta: 0.005,
                                    }}
                                    scrollEnabled={false}
                                    zoomEnabled={false}
                                >
                                    <Marker coordinate={place.coordinate}>
                                        <View style={styles.miniMapMarker}>
                                            <MaterialIcons name="restaurant" size={16} color={theme.colors.card} />
                                        </View>
                                    </Marker>
                                </MapView>
                            </View>
                        </>
                    )}
                </View>

                {/* Comments Section */}
                <View style={styles.commentsSection}>
                    <Text style={styles.sectionTitle}>Yorumlar ({comments.length})</Text>

                    {comments.length === 0 ? (
                        <View style={styles.emptyCommentBox}>
                            <MaterialIcons name="chat-bubble-outline" size={40} color={theme.colors.textSecondary} />
                            <Text style={styles.emptyCommentText}>İlk yorumu siz yapın!</Text>
                        </View>
                    ) : (
                        comments.map((comment) => (
                            <View key={comment.id} style={styles.commentCard}>
                                <View style={styles.commentHeader}>
                                    <View style={styles.commentUser}>
                                        <View style={styles.avatarPlaceholder}>
                                            <Text style={styles.avatarText}>{comment.user.charAt(0)}</Text>
                                        </View>
                                        <Text style={styles.commentUserName}>{comment.user}</Text>
                                    </View>
                                    <View style={styles.commentRating}>
                                        {[...Array(5)].map((_, i) => (
                                            <MaterialIcons key={i} name="star" size={14} color={i < comment.rating ? "#FFD700" : theme.colors.border} />
                                        ))}
                                    </View>
                                </View>
                                <Text style={styles.commentText}>{comment.text}</Text>
                                <Text style={styles.commentDate}>{comment.date}</Text>
                            </View>
                        ))
                    )}
                </View>

            </ScrollView>

            {!isCommenting && (
                <View style={styles.fabWrapper}>
                    <TouchableOpacity style={styles.fabButton} onPress={() => setIsCommenting(true)}>
                        <MaterialIcons name="edit" size={20} color={theme.colors.card} style={{ marginRight: 8 }} />
                        <Text style={styles.fabText}>Yorum Yaz</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Comment Drawer Modal */}
            <Modal
                visible={isCommenting}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsCommenting(false)}
            >
                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <TouchableOpacity style={styles.modalBackdrop} onPress={() => setIsCommenting(false)} />
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Deneyiminizi Puanlayın</Text>
                            <TouchableOpacity onPress={() => setIsCommenting(false)}>
                                <MaterialIcons name="close" size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.starSelectorModal}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity key={star} onPress={() => setNewRating(star)} style={{ padding: 4 }}>
                                    <MaterialIcons name={star <= newRating ? "star" : "star-border"} size={40} color="#FFD700" />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TextInput
                            style={styles.modalInput}
                            placeholder="Mekan hakkında ne düşünüyorsunuz?"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={newComment}
                            onChangeText={setNewComment}
                            multiline
                            autoFocus
                        />

                        <TouchableOpacity
                            style={[styles.modalSubmitButton, !newComment.trim() && { opacity: 0.5 }]}
                            disabled={!newComment.trim()}
                            onPress={handleSendComment}
                        >
                            <Text style={styles.modalSubmitText}>Gönder</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    imageContainer: {
        height: 300,
        width: '100%',
        position: 'relative',
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ratingBadge: {
        position: 'absolute',
        bottom: -15,
        right: 30,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    ratingText: {
        ...theme.typography.h3,
        color: theme.colors.text,
    },
    infoSection: {
        padding: 24,
        backgroundColor: theme.colors.card,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        ...theme.typography.h1,
        flex: 1,
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        marginTop: 4,
        marginBottom: 16,
    },
    metaRow: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    metaText: {
        ...theme.typography.caption,
        marginLeft: 6,
        fontWeight: '500',
    },
    sectionTitle: {
        ...theme.typography.h2,
        marginBottom: 12,
    },
    description: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        lineHeight: 24,
        marginBottom: 24,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    actionBtn: {
        alignItems: 'center',
    },
    actionBtnText: {
        ...theme.typography.caption,
        color: theme.colors.primary,
        fontWeight: '600',
        marginTop: 6,
    },
    commentsSection: {
        padding: 24,
    },
    commentCard: {
        backgroundColor: theme.colors.card,
        padding: 16,
        borderRadius: theme.borderRadius.md,
        marginBottom: 16,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    commentUser: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarPlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    avatarText: {
        color: theme.colors.card,
        fontWeight: 'bold',
        fontSize: 14,
    },
    commentUserName: {
        ...theme.typography.body,
        fontWeight: '600',
    },
    commentRating: {
        flexDirection: 'row',
    },
    commentText: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        lineHeight: 22,
        marginBottom: 8,
    },
    commentDate: {
        ...theme.typography.small,
    },
    fabWrapper: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 40 : 30,
        alignSelf: 'center',
    },
    fabButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    fabText: {
        ...theme.typography.h3,
        color: theme.colors.card,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
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
    starSelectorModal: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    modalInput: {
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        padding: 16,
        minHeight: 100,
        ...theme.typography.body,
        textAlignVertical: 'top',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    modalSubmitButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
    },
    modalSubmitText: {
        ...theme.typography.h3,
        color: theme.colors.card,
    },
    miniMapContainer: {
        width: '100%',
        height: 150,
        borderRadius: theme.borderRadius.md,
        overflow: 'hidden',
        marginTop: 5,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    miniMap: {
        ...StyleSheet.absoluteFillObject,
    },
    miniMapMarker: {
        backgroundColor: theme.colors.primary,
        padding: 6,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: theme.colors.card,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    emptyCommentBox: {
        alignItems: 'center',
        paddingVertical: 30,
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.md,
    },
    emptyCommentText: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        marginTop: 8,
    }
});

export default PlaceDetailScreen;
