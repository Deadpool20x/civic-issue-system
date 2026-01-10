/**
 * Profile Screen
 * 
 * Citizen profile management with logout functionality.
 * Simple logout that clears token and redirects to Login.
 */

import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { removeToken } from '../services/authStorage';

const ProfileScreen = ({ navigation }) => {
    const handleLogout = async () => {
        try {
            // Remove JWT token from storage
            await removeToken();

            // Navigate to Login (replace, not push)
            navigation.replace('Login');
        } catch (error) {
            // If any error occurs, still navigate to Login
            navigation.replace('Login');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>My Profile</Text>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 32,
    },
    logoutButton: {
        backgroundColor: '#dc3545',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 6,
        width: '100%',
        alignItems: 'center',
    },
    logoutButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ProfileScreen;