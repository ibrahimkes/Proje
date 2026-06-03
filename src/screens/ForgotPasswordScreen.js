import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { theme } from '../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/authContext';

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const { resetPassword } = useAuth();

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert('Hata', 'Lütfen e-posta adresinizi girin.');
            return;
        }

        const response = await resetPassword(email);
        if (response.success) {
            Alert.alert('Başarılı', 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu (ve spam klasörünü) kontrol edin.', [
                { text: 'Tamam', onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert('Hata', response.msg);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.headerContainer}>
                <View style={styles.iconContainer}>
                    <MaterialIcons name="lock-reset" size={60} color={theme.colors.card} />
                </View>
                <Text style={styles.title}>Şifremi Unuttum</Text>
                <Text style={styles.subtitle}>E-posta adresinizi girerek şifrenizi sıfırlayabilirsiniz</Text>
            </View>

            <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                    <MaterialIcons name="email" size={24} color={theme.colors.iconColor} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="E-posta"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <TouchableOpacity style={styles.resetButton} onPress={handleResetPassword}>
                    <Text style={styles.resetButtonText}>Bağlantı Gönder</Text>
                </TouchableOpacity>

                <View style={styles.backContainer}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.backTextBold}>Giriş Ekranına Dön</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    headerContainer: {
        flex: 0.4,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        paddingTop: 40,
    },
    iconContainer: {
        width: 100,
        height: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.card,
        textAlign: 'center',
        lineHeight: 32,
    },
    subtitle: {
        ...theme.typography.body,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 10,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    formContainer: {
        flex: 0.6,
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.md,
        marginBottom: 30,
        paddingHorizontal: 15,
        height: 60,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        ...theme.typography.body,
        color: theme.colors.text,
        height: '100%',
    },
    resetButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.md,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    resetButtonText: {
        ...theme.typography.h3,
        color: theme.colors.card,
    },
    backContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
    },
    backTextBold: {
        ...theme.typography.body,
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
});

export default ForgotPasswordScreen;
