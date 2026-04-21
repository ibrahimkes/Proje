import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import { theme } from '../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/authContext';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
            return;
        }
        const response = await login(email, password);
        if (!response.success) {
            Alert.alert('Giriş Hatası', response.msg);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.headerContainer}>
                <View style={styles.iconContainer}>
                    <MaterialIcons name="restaurant" size={60} color={theme.colors.card} />
                </View>
                <Text style={styles.title}>Yöresel Lezzetleri{'\n'}Keşfet</Text>
                <Text style={styles.subtitle}>Eşsiz tatlar bir tık uzağında</Text>
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

                <View style={styles.inputContainer}>
                    <MaterialIcons name="lock" size={24} color={theme.colors.iconColor} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Şifre"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                        <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={24} color={theme.colors.iconColor} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                    <Text style={styles.loginButtonText}>Giriş Yap</Text>
                </TouchableOpacity>

                <View style={styles.registerContainer}>
                    <Text style={styles.registerText}>Hesabın yok mu? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.registerTextBold}>Kayıt Ol</Text>
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
        marginBottom: 20,
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
    eyeIcon: {
        padding: 10,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 30,
    },
    forgotPasswordText: {
        ...theme.typography.caption,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    loginButton: {
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
    loginButtonText: {
        ...theme.typography.h3,
        color: theme.colors.card,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
    },
    registerText: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
    },
    registerTextBold: {
        ...theme.typography.body,
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
});

export default LoginScreen;
