/**
 * Register Screen
 * 
 * Citizen registration screen for the Civic Issue Reporting System.
 * Handles account creation with backend role enforcement (citizen only).
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import apiClient from '../services/api';

const RegisterScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        // Validate all fields required
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'All fields are required');
            return;
        }

        // Validate password match
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            // Log API request payload
            console.log('Register API Request Payload:', { name, email, password });

            // Call backend registration
            // Do NOT send role - backend will enforce citizen role
            const response = await apiClient.post('/auth/register', {
                name,
                email,
                password,
            });

            // Log API response
            console.log('Register API Response:', response.data);

            // Temporary console log to confirm API call is firing
            console.log('Register API call fired successfully');

            // Registration successful
            Alert.alert(
                'Success',
                'Account created successfully! Please login to continue.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Navigate to Login (replace, not push)
                            navigation.replace('Login');
                        },
                    },
                ]
            );

        } catch (error) {
            // Handle registration failure
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'Registration failed. Please try again.';

            // Log the error for debugging
            console.error('Registration Error:', error.response?.data || error.message);

            Alert.alert('Registration Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginLink = () => {
        // Navigate to Login (replace, not push)
        navigation.replace('Login');
    };

    return (
        <View style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join the civic community</Text>

                {/* Full Name Input */}
                <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    autoCorrect={false}
                    editable={!loading}
                />

                {/* Email Input */}
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                />

                {/* Password Input */}
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                />

                {/* Confirm Password Input */}
                <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={true}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                />

                {/* Register Button */}
                <TouchableOpacity
                    style={[styles.registerButton, loading && styles.disabledButton]}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    <Text style={styles.registerButtonText}>
                        {loading ? 'Creating Account...' : 'Register'}
                    </Text>
                </TouchableOpacity>

                {/* Login Link */}
                <TouchableOpacity
                    style={styles.loginLink}
                    onPress={handleLoginLink}
                    disabled={loading}
                >
                    <Text style={styles.loginText}>
                        Already have an account?{' '}
                        <Text style={styles.loginLinkText}>Login</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    formContainer: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        padding: 12,
        marginBottom: 12,
        fontSize: 16,
        backgroundColor: 'white',
        color: '#333', // Dark text color on light background
    },
    registerButton: {
        backgroundColor: '#007AFF',
        padding: 14,
        borderRadius: 4,
        alignItems: 'center',
        marginTop: 8,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    registerButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loginLink: {
        marginTop: 16,
        alignItems: 'center',
    },
    loginText: {
        color: '#666',
        fontSize: 14,
    },
    loginLinkText: {
        color: '#007AFF',
        fontWeight: '600',
    },
});

export default RegisterScreen;