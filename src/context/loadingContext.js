import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { View, StyleSheet, Modal, Animated, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const scaleValue = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        if (isLoading) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scaleValue, {
                        toValue: 1.2,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleValue, {
                        toValue: 0.8,
                        duration: 600,
                        useNativeDriver: true,
                    })
                ])
            ).start();
        } else {
            scaleValue.setValue(0.8);
        }
    }, [isLoading, scaleValue]);

    return (
        <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
            {children}
            {isLoading && (
                <View style={styles.overlay}>
                    <View style={styles.loadingBox}>
                        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                            <MaterialIcons name="restaurant" size={48} color={theme.colors.primary} />
                        </Animated.View>
                        <Text style={styles.loadingText}>Lütfen Bekleyin...</Text>
                    </View>
                </View>
            )}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => useContext(LoadingContext);

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 99999,
        elevation: 9999,
    },
    loadingBox: {
        width: 150,
        height: 150,
        backgroundColor: theme.colors.card,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    loadingText: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 20,
        letterSpacing: 0.5,
    }
});
