import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import MapScreen from '../screens/MapScreen';
import SavedScreen from '../screens/SavedScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PlaceDetailScreen from '../screens/PlaceDetailScreen';
import AccountSettingsScreen from '../screens/AccountSettingsScreen';
import PrivacySettingsScreen from '../screens/PrivacySettingsScreen';
import AdminPanelScreen from '../screens/AdminPanelScreen';
import { useAuth } from '../context/authContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
    const { user } = useAuth();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Keşfet') {
                        iconName = 'explore';
                    } else if (route.name === 'Kaydedilenler') {
                        iconName = 'bookmark';
                    } else if (route.name === 'Profil') {
                        iconName = 'person';
                    } else if (route.name === 'Admin') {
                        iconName = 'admin-panel-settings';
                    }

                    return <MaterialIcons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
                headerShown: false,
            })}
        >
            <Tab.Screen name="Keşfet" component={MapScreen} />
            <Tab.Screen name="Kaydedilenler" component={SavedScreen} />
            <Tab.Screen name="Profil" component={ProfileScreen} />
            {user?.isAdmin && (
                <Tab.Screen name="Admin" component={AdminPanelScreen} />
            )}
        </Tab.Navigator>
    );
};

const AppNavigator = () => {
    const { isAuthenticated } = useAuth();

    if (typeof isAuthenticated === 'undefined') {
        return null;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isAuthenticated ? (
                    <>
                        <Stack.Screen name="MainTabs" component={MainTabs} />
                        <Stack.Screen name="PlaceDetail" component={PlaceDetailScreen} />
                        <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
                        <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
