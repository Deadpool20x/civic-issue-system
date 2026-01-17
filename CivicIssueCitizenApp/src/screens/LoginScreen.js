/**
 * Login Screen
 *
 * Citizen authentication screen for the Civic Issue Reporting System.
 * Handles email/password login and JWT token storage.
 */
import { APP_MODE } from '../config/appMode';
import auth from '@react-native-firebase/auth';

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

    /**
     * DEMO MODE login handler.
     * Simulates a successful login without backend calls.
     */
    const handleLogin = async () => {
        console.log('Login button pressed - FIREBASE MODE');

        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        try {
            setLoading(true);

            const userCredential = await auth().signInWithEmailAndPassword(
                email.trim(),
                password
            );

            console.log('Firebase login success:', userCredential.user.email);

            navigation.replace('Home');
        } catch (error) {
            console.error('Firebase login error:', error);

            Alert.alert(
                'Login Failed',
                error.message || 'Something went wrong'
            );
        } finally {
            setLoading(false);
        }
    };



    // Original handleLogin function (temporarily disabled to prevent crashes)
    /*
    const handleLogin = async () => {
        try {
            const res = await apiClient.get('/health');
            console.log('HEALTH CHECK RESPONSE:', res.data);
        } catch (err) {
            console.log('HEALTH CHECK ERROR:', err.message);
        }

        // Validate inputs
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        setLoading(true);

        try {
            // Log API request payload
            console.log('Login API Request Payload:', { email, password });

            // Call backend authentication
            const response = await apiClient.post('/auth/login', {
                email,
                password,
            });

            // Log API response
            console.log('Login API Response:', response.data);

            // Temporary console log to confirm API call is firing
            console.log('Login API call fired successfully');

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
                error.message ||
                'Login failed. Please check your credentials.';

            // Log the error for debugging
            console.error('Login Error:', error.response?.data || error.message);

            Alert.alert('Login Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };
    */

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
        color: '#333', // Dark text color on light background
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

// import React, { useState } from 'react';
// import { View, Text, TextInput, Button, Alert } from 'react-native';
// import auth from '@react-native-firebase/auth';

// const LoginScreen = () => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');

//     const login = async () => {
//         try {
//             const result = await auth().signInWithEmailAndPassword(email, password);
//             console.log('LOGIN SUCCESS:', result.user.email);
//             Alert.alert('Success', 'Logged in successfully');
//         } catch (error) {
//             console.log('LOGIN ERROR:', error.message);
//             Alert.alert('Login failed', error.message);
//         }
//     };

//     return (
//         <View style={{ padding: 20 }}>
//             <Text style={{ fontSize: 22, marginBottom: 20 }}>Login</Text>

//             <TextInput
//                 placeholder="Email"
//                 value={email}
//                 onChangeText={setEmail}
//                 autoCapitalize="none"
//                 style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
//             />

//             <TextInput
//                 placeholder="Password"
//                 value={password}
//                 onChangeText={setPassword}
//                 secureTextEntry
//                 style={{ borderWidth: 1, marginBottom: 20, padding: 10 }}
//             />

//             <Button title="Login" onPress={login} />
//         </View>
//     );
// };

// export default LoginScreen;
