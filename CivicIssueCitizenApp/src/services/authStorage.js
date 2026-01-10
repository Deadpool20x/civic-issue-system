/**
 * Authentication Storage Utility
 * 
 * Handles JWT token storage using AsyncStorage.
 * Provides secure storage, retrieval, and removal of authentication tokens.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Single constant key for token storage
const AUTH_TOKEN_KEY = 'AUTH_TOKEN';

/**
 * Save JWT token to AsyncStorage
 * @param {string} token - The JWT token to save
 * @returns {Promise<boolean>} - Success status
 */
const saveToken = async (token) => {
    try {
        if (!token || typeof token !== 'string') {
            return false;
        }
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
        return true;
    } catch (error) {
        // Return null on failure as required
        return null;
    }
};

/**
 * Retrieve JWT token from AsyncStorage
 * @returns {Promise<string|null>} - The stored token or null
 */
const getToken = async () => {
    try {
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        return token || null;
    } catch (error) {
        // Return null on failure as required
        return null;
    }
};

/**
 * Remove JWT token from AsyncStorage
 * @returns {Promise<boolean>} - Success status
 */
const removeToken = async () => {
    try {
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
        return true;
    } catch (error) {
        // Return null on failure as required
        return null;
    }
};

// Export all functions
export {
    saveToken,
    getToken,
    removeToken
};