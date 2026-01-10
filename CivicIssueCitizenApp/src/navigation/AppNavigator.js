/**
 * App Navigator
 * 
 * Navigation skeleton with placeholder routes only.
 * This file defines the navigation structure without implementing screens.
 */

import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
import { getToken } from '../services/authStorage';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import CreateIssueScreen from '../screens/CreateIssueScreen';
import MyIssuesScreen from '../screens/MyIssuesScreen';
import IssueDetailScreen from '../screens/IssueDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Create stack navigator
const Stack = createNativeStackNavigator();

// Splash screen with token check logic
const Splash = ({ navigation }) => {
    useEffect(() => {
        // Check for token and navigate immediately
        const checkToken = async () => {
            try {
                const token = await getToken();
                if (token) {
                    navigation.replace('Home');
                } else {
                    navigation.replace('Login');
                }
            } catch (error) {
                // If any error occurs, go to Login
                navigation.replace('Login');
            }
        };

        checkToken();
    }, [navigation]);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
                Splash
            </Text>
            <Text style={{ fontSize: 16, color: '#666' }}>
                Checking authentication...
            </Text>
        </View>
    );
};

// Placeholder component for other routes
const PlaceholderScreen = ({ routeName }) => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
            {routeName}
        </Text>
        <Text style={{ fontSize: 16, color: '#666' }}>
            Placeholder Screen
        </Text>
    </View>
);

// Route definitions with placeholder components
const AppNavigator = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Splash"
                component={Splash}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="CreateIssue"
                component={CreateIssueScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="MyIssues"
                component={MyIssuesScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="IssueDetail"
                component={IssueDetailScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};

export default AppNavigator;