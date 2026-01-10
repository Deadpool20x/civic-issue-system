/**
 * Create Issue Screen
 * 
 * Citizen issue reporting screen with image upload capability.
 * Handles issue creation with multipart/form-data submission.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    Image,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import apiClient from '../services/api';

const CreateIssueScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    // Handle image selection from gallery
    const handleAddImage = () => {
        launchImageLibrary(
            {
                mediaType: 'photo',
                selectionLimit: 5,
                includeBase64: false,
            },
            (response) => {
                // User cancelled selection
                if (response.didCancel) {
                    return;
                }

                // Handle error
                if (response.error) {
                    Alert.alert('Error', response.error);
                    return;
                }

                // Map selected assets to image objects
                if (response.assets && response.assets.length > 0) {
                    const newImages = response.assets.map((asset) => ({
                        uri: asset.uri,
                        type: asset.type || 'image/jpeg',
                        name: asset.fileName || `image_${Date.now()}.jpg`,
                    }));

                    // Add to existing images
                    setImages((prev) => [...prev, ...newImages]);
                }
            }
        );
    };

    const handleRemoveImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        // Validate inputs
        if (!title.trim()) {
            Alert.alert('Error', 'Issue title is required');
            return;
        }

        if (!description.trim()) {
            Alert.alert('Error', 'Issue description is required');
            return;
        }

        setLoading(true);

        try {
            // Prepare multipart/form-data
            const formData = new FormData();
            formData.append('title', title.trim());
            formData.append('description', description.trim());

            // Add images if any
            if (images.length > 0) {
                images.forEach((image, index) => {
                    formData.append('images[]', image);
                });
            }

            // Submit issue
            const response = await apiClient.post('/api/issues', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Success handling
            Alert.alert(
                'Success',
                'Issue reported successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Navigate back to Home
                            navigation.replace('Home');
                        },
                    },
                ]
            );

        } catch (error) {
            // Error handling
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                'Failed to submit issue. Please try again.';
            Alert.alert('Submission Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Report New Issue</Text>
                <Text style={styles.subtitle}>Help improve your community</Text>

                {/* Issue Title */}
                <Text style={styles.label}>Issue Title *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Brief description of the issue"
                    value={title}
                    onChangeText={setTitle}
                    editable={!loading}
                />

                {/* Issue Description */}
                <Text style={styles.label}>Description *</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Provide details about the issue location, severity, etc."
                    value={description}
                    onChangeText={setDescription}
                    multiline={true}
                    numberOfLines={5}
                    editable={!loading}
                />

                {/* Image Section */}
                <Text style={styles.label}>Images (Optional)</Text>
                <TouchableOpacity
                    style={styles.imageButton}
                    onPress={handleAddImage}
                    disabled={loading}
                >
                    <Text style={styles.imageButtonText}>Add Image</Text>
                </TouchableOpacity>

                {/* Image Previews */}
                {images.length > 0 && (
                    <View style={styles.imagePreviewContainer}>
                        {images.map((image, index) => (
                            <View key={index} style={styles.imagePreviewWrapper}>
                                <Image
                                    source={{ uri: image.uri }}
                                    style={styles.imagePreview}
                                />
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => handleRemoveImage(index)}
                                    disabled={loading}
                                >
                                    <Text style={styles.removeImageText}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    <Text style={styles.submitButtonText}>
                        {loading ? 'Submitting...' : 'Submit Issue'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    imageButton: {
        backgroundColor: '#6c757d',
        padding: 12,
        borderRadius: 4,
        alignItems: 'center',
        marginBottom: 16,
    },
    imageButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    imagePreviewContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
        gap: 8,
    },
    imagePreviewWrapper: {
        position: 'relative',
        width: 80,
        height: 80,
        borderRadius: 4,
        overflow: 'hidden',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    removeImageButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(0,0,0,0.6)',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeImageText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    submitButton: {
        backgroundColor: '#28a745',
        padding: 16,
        borderRadius: 4,
        alignItems: 'center',
        marginTop: 8,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CreateIssueScreen;