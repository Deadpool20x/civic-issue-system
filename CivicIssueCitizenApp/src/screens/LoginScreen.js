/**
 * Login Screen
 * 
 * Citizen authentication screen for the Civic Issue Reporting System.
 * Handles email/password login and JWT token storage.
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
import { saveToken } from '../services/authStorage';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        // Validate inputs
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        setLoading(true);

        try {
            // Call backend authentication
            const response = await apiClient.post('/auth/login', {
                email,
                password,
            });

            // Extract JWT token from response
            const token = response.data?.token || response.data?.data?.token;

            if (token) {
                // Save token securely
                const saved = await saveToken(token);

                if (saved) {
                    // Navigate to Home (replace, not push)
                    navigation.replace('Home');
                } else {
                    Alert.alert('Error', 'Failed to save authentication token');
                }
            } else {
                Alert.alert('Error', 'Invalid response from server');
            }
        } catch (error) {
            // Handle authentication failure
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                'Login failed. Please check your credentials.';
            Alert.alert('Login Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAccount = () => {
        navigation.navigate('Register');
    };

    return (
        <View style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to report issues</Text>

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

                {/* Password Input with Show/Hide Toggle */}
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={[styles.input, styles.passwordInput]}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!loading}
                    />
                    <TouchableOpacity
                        style={styles.toggleButton}
                        onPress={() => setShowPassword(!showPassword)}
                        disabled={loading}
                    >
                        <Text style={styles.toggleText}>
                            {showPassword ? 'Hide' : 'Show'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                    style={[styles.loginButton, loading && styles.disabledButton]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    <Text style={styles.loginButtonText}>
                        {loading ? 'Logging in...' : 'Login'}
                    </Text>
                </TouchableOpacity>

                {/* Create Account Link */}
                <TouchableOpacity
                    style={styles.registerLink}
                    onPress={handleCreateAccount}
                    disabled={loading}
                >
                    <Text style={styles.registerText}>
                        Don't have an account?{' '}
                        <Text style={styles.registerLinkText}>Create account</Text>
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
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    passwordInput: {
        flex: 1,
        marginBottom: 0,
    },
    toggleButton: {
        padding: 12,
        marginLeft: 8,
    },
    toggleText: {
        color: '#007AFF',
        fontWeight: '600',
    },
    loginButton: {
        backgroundColor: '#007AFF',
        padding: 14,
        borderRadius: 4,
        alignItems: 'center',
        marginTop: 8,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    loginButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    registerLink: {
        marginTop: 16,
        alignItems: 'center',
    },
    registerText: {
        color: '#666',
        fontSize: 14,
    },
    registerLinkText: {
        color: '#007AFF',
        fontWeight: '600',
    },
});

export default LoginScreen;