import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

const PlaceDetailScreen = ({ route, navigation }) => {
    const { place } = route.params || {};
    const [newComment, setNewComment] = useState('');

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
                        <MaterialIcons name="favorite-border" size={28} color={theme.colors.textSecondary} />
                    </View>
                    <Text style={styles.subtitle}>{place.subtitle}</Text>


                    <Text style={styles.sectionTitle}>Hakkında</Text>
                    <Text style={styles.description}>{place.description}</Text>

                    {/* Action Buttons */}
                    <View style={styles.actionRow}>

                        <TouchableOpacity style={styles.actionBtn}>
                            <MaterialIcons name="call" size={24} color={theme.colors.primary} />
                            <Text style={styles.actionBtnText}>Ara</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn}>
                            <MaterialIcons name="share" size={24} color={theme.colors.primary} />
                            <Text style={styles.actionBtnText}>Paylaş</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Comments Section */}
                <View style={styles.commentsSection}>
                    <Text style={styles.sectionTitle}>Yorumlar ({place.comments?.length || 0})</Text>

                    {place.comments?.map((comment) => (
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
                    ))}
                </View>

            </ScrollView>

            {/* Add Comment Input */}
            <View style={styles.addCommentContainer}>
                <TextInput
                    style={styles.commentInput}
                    placeholder="Yorumunuzu yazın..."
                    placeholderTextColor={theme.colors.textSecondary}
                    value={newComment}
                    onChangeText={setNewComment}
                    multiline
                />
                <TouchableOpacity style={styles.sendButton} disabled={!newComment.trim()}>
                    <MaterialIcons
                        name="send"
                        size={24}
                        color={newComment.trim() ? theme.colors.card : 'rgba(255,255,255,0.5)'}
                    />
                </TouchableOpacity>
            </View>
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
    addCommentContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: theme.colors.card,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 30 : 20,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 10,
    },
    commentInput: {
        flex: 1,
        backgroundColor: theme.colors.background,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
        marginRight: 12,
        maxHeight: 100,
        minHeight: 48,
        ...theme.typography.body,
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default PlaceDetailScreen;
