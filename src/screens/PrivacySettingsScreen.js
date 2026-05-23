import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { useAuth } from '../context/authContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PrivacySettingsScreen = ({ navigation }) => {
    const { changeUserPassword, deleteUserAccount, logout } = useAuth();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const insets = useSafeAreaInsets();

    const handlePasswordChange = async () => {
        if (!newPassword || newPassword.length < 6) {
            Alert.alert("Hata", "Şifre en az 6 karakter olmalıdır.");
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert("Hata", "Şifreler eşleşmiyor.");
            return;
        }

        setIsSaving(true);
        const res = await changeUserPassword(newPassword);
        setIsSaving(false);

        if (res.success) {
            Alert.alert("Başarılı", "Şifreniz başarıyla güncellendi.");
            setNewPassword('');
            setConfirmPassword('');
        } else {
            // Re-authentication may be required for recently signed in users.
            Alert.alert("Hata", "Şifre değiştirilemedi. Lütfen çıkış yapıp tekrar giriş yapın ve yeniden deneyin. (" + res.msg + ")");
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            "Hesabı Sil",
            "Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm verileriniz kaybolur.",
            [
                { text: "İptal", style: "cancel" },
                {
                    text: "Evet, Sil",
                    style: "destructive",
                    onPress: async () => {
                        const res = await deleteUserAccount();
                        if (res.success) {
                            // User is deleted, auth state change will handle navigation
                        } else {
                            Alert.alert("Hata", "Hesap silinemedi. Lütfen çıkış yapıp tekrar giriş yapın ve yeniden deneyin.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Gizlilik ve Güvenlik</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Şifre Değiştir</Text>
                    <Text style={styles.sectionDesc}>Hesabınızın güvenliği için şifrenizi güçlü tutun.</Text>

                    <View style={styles.inputGroup}>
                        <View style={styles.inputBox}>
                            <MaterialIcons name="lock-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                placeholder="Yeni Şifre"
                                placeholderTextColor={theme.colors.textSecondary}
                                secureTextEntry
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={styles.inputBox}>
                            <MaterialIcons name="lock" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Yeni Şifre (Tekrar)"
                                placeholderTextColor={theme.colors.textSecondary}
                                secureTextEntry
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                        onPress={handlePasswordChange}
                        disabled={isSaving}
                    >
                        <Text style={styles.saveButtonText}>{isSaving ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.section, { marginTop: 20, marginBottom: insets.bottom + 50 }]}>
                    <Text style={[styles.sectionTitle, { color: '#e74c3c' }]}>Hesabı Sil</Text>
                    <Text style={styles.sectionDesc}>Hesabınızı ve tüm verilerinizi kalıcı olarak silmek istiyorsanız aşağıdaki butonu kullanabilirsiniz.</Text>

                    <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
                        <MaterialIcons name="delete-forever" size={24} color="#e74c3c" style={{ marginRight: 8 }} />
                        <Text style={styles.deleteButtonText}>Hesabımı Kalıcı Olarak Sil</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: theme.colors.card,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        ...theme.typography.h2,
        color: theme.colors.text,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        backgroundColor: theme.colors.card,
        padding: 20,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    sectionTitle: {
        ...theme.typography.h2,
        marginBottom: 8,
    },
    sectionDesc: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: 16,
        height: 55,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        ...theme.typography.body,
        color: theme.colors.text,
    },
    saveButton: {
        backgroundColor: theme.colors.primary,
        height: 50,
        borderRadius: theme.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        ...theme.typography.h3,
        color: theme.colors.card,
    },
    deleteButton: {
        flexDirection: 'row',
        height: 50,
        borderRadius: theme.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e74c3c',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        marginTop: 10,
    },
    deleteButtonText: {
        ...theme.typography.h3,
        color: '#e74c3c',
    }
});

export default PrivacySettingsScreen;
