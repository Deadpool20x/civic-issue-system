/**
 * Issue Detail Screen
 * 
 * Citizen view of single issue with full details, images, and status history.
 * Read-only view with timeline and image gallery.
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    Image,
    Modal,
} from 'react-native';
import apiClient from '../services/api';
import { APP_MODE } from '../config/appMode';

const IssueDetailScreen = ({ route, navigation }) => {
    const { issueId } = route.params;

    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    // Fetch issue details on mount
    useEffect(() => {
        fetchIssueDetail();
    }, [issueId]);

    const fetchIssueDetail = async () => {
        console.log('Fetching issue details. APP_MODE =', APP_MODE);

        if (APP_MODE === 'DEMO') {
            console.log('Running in DEMO MODE. Using mock issue detail.');

            setIssue({
                id: route.params?.id ?? '1',
                title: 'Broken Street Light',
                status: 'Open',
                description: 'Street light not working for 3 days',
                location: 'Main Road, Sector 12',
                createdAt: '2026-01-10',
            });

            return;
        }

        // REAL backend code stays below
        try {
            const response = await apiClient.get(`/issues/${route.params.id}`);
            setIssue(response.data);
        } catch (error) {
            console.error('Fetch Issue Detail Error:', error.message);
        }
    };

    // const fetchIssueDetail = async () => {
    //     try {
    //         setLoading(true);
    //         setError(null);

    //         // Log API request
    //         console.log('Fetching issue details from API');

    //         // Call GET /api/issues/{issueId}
    //         const response = await apiClient.get(`/api/issues/${issueId}`);

    //         // Log API response
    //         console.log('Fetch Issue Detail API Response:', response.data);

    //         // Temporary console log to confirm API call is firing
    //         console.log('Fetch Issue Detail API call fired successfully');

    //         // Extract issue data
    //         const issueData = response.data?.issue || response.data;

    //         if (!issueData) {
    //             throw new Error('Issue not found');
    //         }

    //         setIssue(issueData);
    //     } catch (err) {
    //         const errorMessage = err.response?.data?.message ||
    //             err.response?.data?.error ||
    //             err.message ||
    //             'Failed to load issue details';

    //         // Log the error for debugging
    //         console.error('Fetch Issue Detail Error:', err.response?.data || err.message);

    //         setError(errorMessage);
    //         Alert.alert('Error', errorMessage, [
    //             {
    //                 text: 'Go Back',
    //                 onPress: () => navigation.goBack(),
    //             },
    //         ]);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // Handle image tap
    const handleImagePress = (imageUrl) => {
        setSelectedImage(imageUrl);
    };

    // Close modal
    const closeModal = () => {
        setSelectedImage(null);
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Render issue info section
    const renderIssueInfo = () => {
        if (!issue) return null;

        const title = issue.title || 'Untitled Issue';
        const description = issue.description || 'No description provided';
        const status = issue.status || 'Pending';
        const createdAt = issue.createdAt || issue.created;

        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Issue Information</Text>
                <View style={styles.infoCard}>
                    <Text style={styles.label}>Title</Text>
                    <Text style={styles.value}>{title}</Text>

                    <Text style={styles.label}>Description</Text>
                    <Text style={styles.value}>{description}</Text>

                    <Text style={styles.label}>Current Status</Text>
                    <Text style={[styles.statusBadge, styles[`status_${status}`]]}>
                        {status}
                    </Text>

                    <Text style={styles.label}>Created</Text>
                    <Text style={styles.value}>{formatDate(createdAt)}</Text>
                </View>
            </View>
        );
    };

    // Render image gallery
    const renderImages = () => {
        if (!issue || !issue.images || issue.images.length === 0) {
            return null;
        }

        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Uploaded Images</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.imageScroll}
                >
                    {issue.images.map((imageUrl, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => handleImagePress(imageUrl)}
                        >
                            <Image
                                source={{ uri: imageUrl }}
                                style={styles.imageThumbnail}
                            />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    };

    // Render status history timeline
    const renderStatusHistory = () => {
        if (!issue || !issue.statusHistory || issue.statusHistory.length === 0) {
            return (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Status History</Text>
                    <View style={styles.infoCard}>
                        <Text style={styles.value}>No status history available</Text>
                    </View>
                </View>
            );
        }

        // Sort by date (oldest first)
        const sortedHistory = [...issue.statusHistory].sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        );

        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Status History</Text>
                <View style={styles.timeline}>
                    {sortedHistory.map((entry, index) => (
                        <View key={index} style={styles.timelineItem}>
                            {/* Timeline dot */}
                            <View style={styles.timelineDot} />

                            {/* Timeline line */}
                            {index < sortedHistory.length - 1 && (
                                <View style={styles.timelineLine} />
                            )}

                            {/* Timeline content */}
                            <View style={styles.timelineContent}>
                                <Text style={styles.timelineTitle}>
                                    {entry.fromStatus} → {entry.toStatus}
                                </Text>
                                <Text style={styles.timelineDate}>
                                    {formatDate(entry.date)}
                                </Text>
                                {entry.reason && (
                                    <Text style={styles.timelineReason}>
                                        {entry.reason}
                                    </Text>
                                )}
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    // Show loading state
    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading issue details...</Text>
            </View>
        );
    }

    // Show error state (already handled with alert, but just in case)
    if (error && !issue) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {renderIssueInfo()}
                {renderImages()}
                {renderStatusHistory()}
            </ScrollView>

            {/* Image Modal */}
            <Modal
                visible={!!selectedImage}
                transparent={true}
                animationType="fade"
                onRequestClose={closeModal}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={closeModal}
                >
                    <View style={styles.modalContent}>
                        <Image
                            source={{ uri: selectedImage }}
                            style={styles.modalImage}
                            resizeMode="contain"
                        />
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={closeModal}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        color: '#d32f2f',
        textAlign: 'center',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    infoCard: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        marginTop: 12,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    value: {
        fontSize: 16,
        color: '#333',
        lineHeight: 22,
    },
    statusBadge: {
        display: 'inline-block',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        alignSelf: 'flex-start',
        marginTop: 4,
    },
    status_Pending: {
        backgroundColor: '#FEF3C7',
        color: '#92400E',
    },
    status_InProgress: {
        backgroundColor: '#DBEAFE',
        color: '#1E40AF',
    },
    status_Resolved: {
        backgroundColor: '#D1FAE5',
        color: '#065F46',
    },
    status_Closed: {
        backgroundColor: '#E5E7EB',
        color: '#374151',
    },
    // Image Gallery
    imageScroll: {
        flexDirection: 'row',
    },
    imageThumbnail: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginRight: 8,
        backgroundColor: '#ddd',
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        height: '80%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalImage: {
        width: '100%',
        height: '90%',
        borderRadius: 8,
    },
    closeButton: {
        marginTop: 16,
        backgroundColor: 'white',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 6,
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    // Timeline
    timeline: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 16,
        position: 'relative',
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#007AFF',
        marginTop: 4,
        marginRight: 12,
        zIndex: 2,
    },
    timelineLine: {
        position: 'absolute',
        left: 5,
        top: 16,
        width: 2,
        height: '100%',
        backgroundColor: '#ddd',
        zIndex: 1,
    },
    timelineContent: {
        flex: 1,
    },
    timelineTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    timelineDate: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    timelineReason: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
        fontStyle: 'italic',
    },
});

export default IssueDetailScreen;