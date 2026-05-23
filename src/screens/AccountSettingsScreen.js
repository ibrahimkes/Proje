import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { useAuth } from '../context/authContext';

const AccountSettingsScreen = ({ navigation }) => {
    const { user, updateUserInfo } = useAuth();
    const [username, setUsername] = useState(user?.username || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!username.trim()) {
            Alert.alert("Hata", "Kullanıcı adı boş olamaz.");
            return;
        }

        setIsSaving(true);
        const res = await updateUserInfo({
            username: username.trim(),
            bio: bio.trim(),
            phone: phone.trim()
        });
        setIsSaving(false);

        if (res.success) {
            Alert.alert("Başarılı", "Hesap bilgileriniz güncellendi.", [
                { text: "Tamam", onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert("Hata", "Bilgiler güncellenemedi: " + res.msg);
        }
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
                <Text style={styles.headerTitle}>Hesap Bilgileri</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
                
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>E-posta Adresi (Değiştirilemez)</Text>
                    <View style={[styles.inputBox, styles.inputDisabled]}>
                        <MaterialIcons name="email" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { color: theme.colors.textSecondary }]}
                            value={user?.email || ''}
                            editable={false}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Kullanıcı Adı</Text>
                    <View style={styles.inputBox}>
                        <MaterialIcons name="person" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Kullanıcı adınız"
                            placeholderTextColor={theme.colors.textSecondary}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Telefon Numarası</Text>
                    <View style={styles.inputBox}>
                        <MaterialIcons name="phone" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Örn: 555 123 45 67"
                            placeholderTextColor={theme.colors.textSecondary}
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Hakkımda</Text>
                    <View style={[styles.inputBox, { height: 100, alignItems: 'flex-start', paddingTop: 12 }]}>
                        <MaterialIcons name="info" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                            value={bio}
                            onChangeText={setBio}
                            placeholder="Kendinizden bahsedin..."
                            placeholderTextColor={theme.colors.textSecondary}
                            multiline
                        />
                    </View>
                </View>

                <TouchableOpacity 
                    style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
                    onPress={handleSave}
                    disabled={isSaving}
                >
                    <Text style={styles.saveButtonText}>{isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</Text>
                </TouchableOpacity>

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
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        ...theme.typography.caption,
        color: theme.colors.text,
        marginBottom: 8,
        fontWeight: '600',
    },
    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: 16,
        height: 55,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    inputDisabled: {
        backgroundColor: '#f5f5f5',
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
        height: 55,
        borderRadius: theme.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        ...theme.typography.h3,
        color: theme.colors.card,
    }
});

export default AccountSettingsScreen;
