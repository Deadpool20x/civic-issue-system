/**
 * Home Screen
 * 
 * Citizen dashboard showing recent issues and navigation options.
 * Read-only view of citizen's reported issues.
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import apiClient from '../services/api';
import { APP_MODE } from '../config/appMode';
import { Color } from 'ogl';
import firestore from '@react-native-firebase/firestore';
const HomeScreen = ({ navigation }) => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const DEMO_ISSUES = [
        {
            id: '1',
            title: 'Street light not working',
            description: 'The street light near my house is broken.',
            status: 'Open',
        },
        {
            id: '2',
            title: 'Garbage not collected',
            description: 'Garbage has not been collected for 3 days.',
            status: 'In Progress',
        },
    ];

    // Fetch issues on mount
    // useEffect(() => {
    //     console.log('HOME SCREEN: forcing demo issues');

    //     setIssues([
    //         {
    //             id: 'demo-1',
    //             title: 'Pothole near main road',
    //             description: 'Large pothole causing traffic issues',
    //             status: 'Open',
    //         },
    //     ]);

    //     setLoading(false);
    // }, []);

    //modified code
    // at top of file, add this import


    // ... inside your component (replace the existing fetchIssues/mock logic)
    useEffect(() => {
        const testFirestore = async () => {
            try {
                console.log('FIRESTORE TEST: starting');

                const snapshot = await firestore()
                    .collection('issues')
                    .limit(1)
                    .get();

                console.log('FIRESTORE TEST: docs count =', snapshot.size);

                if (!snapshot.empty) {
                    const firstDoc = snapshot.docs[0].data();
                    console.log('FIRESTORE TEST: first doc =', firstDoc);
                } else {
                    console.log('FIRESTORE TEST: collection empty');
                }

            } catch (error) {
                console.log('FIRESTORE TEST ERROR:', error.message);
            }
        };

        testFirestore();
    }, []);


    // ensure this is called in your useEffect instead of the mock fetch:
    useEffect(() => {
        // if (APP_MODE === 'DEMO') {
        //     console.log('HOME SCREEN: DEMO MODE active');
        //     setIssues(DEMO_ISSUES);
        //     setLoading(false);
        //     return;
        // }

        // existing real fetch logic stays below
    }, []);


    //original code
    // const fetchIssues = async () => {
    //     try {
    //         setLoading(true);
    //         setError(null);

    //         // Log API request
    //         console.log('Fetching issues from API');

    //         // Call GET /api/issues/my
    //         const response = await apiClient.get('/api/issues/my');

    //         // Log API response
    //         console.log('Fetch Issues API Response:', response.data);

    //         // Temporary console log to confirm API call is firing
    //         console.log('Fetch Issues API call fired successfully');

    //         // Extract issues array from response
    //         const issuesData = response.data?.issues || response.data || [];
    //         setIssues(issuesData);
    //     } catch (err) {
    //         const errorMessage = err.response?.data?.message ||
    //             err.response?.data?.error ||
    //             err.message ||
    //             'Failed to load issues';

    //         // Log the error for debugging
    //         console.error('Fetch Issues Error:', err.response?.data || err.message);

    //         setError(errorMessage);
    //         Alert.alert('Error', errorMessage);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleCreateIssue = () => {
        // Navigate to CreateIssue screen
        navigation.navigate('CreateIssue');
    };

    const handleIssuePress = (issueId) => {
        // Navigate to IssueDetail with issueId
        navigation.navigate('IssueDetail', { issueId });
    };

    // Render individual issue card
    const renderIssueCard = ({ item }) => {
        // Handle different response formats
        const issueId = item._id || item.id || item.issueId;
        const title = item.title || 'Untitled Issue';
        const status = item.status || 'Pending';
        const createdAt = item.createdAt || item.created || new Date().toISOString();

        // Format date
        const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });

        return (
            <TouchableOpacity
                style={styles.issueCard}
                onPress={() => handleIssuePress(issueId)}
            >
                <Text style={styles.issueTitle}>{title}</Text>
                <View style={styles.issueMeta}>
                    <Text style={[styles.statusBadge, styles[`status_${status}`]]}>
                        {status}
                    </Text>
                    <Text style={styles.issueDate}>{formattedDate}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    // Render empty state
    const renderEmptyState = () => {
        if (loading) return null;

        return (
            <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No issues reported yet</Text>
            </View>
        );
    };

    // Render loading state
    if (loading && issues.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading your issues...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
                <Text style={styles.welcomeTitle}>Welcome Back!</Text>
                <Text style={styles.welcomeSubtitle}>Manage your civic issues</Text>
            </View>

            {/* Report New Issue Button */}
            <TouchableOpacity
                style={styles.reportButton}
                onPress={handleCreateIssue}
            >
                <Text style={styles.reportButtonText}>Report New Issue</Text>
            </TouchableOpacity>

            {/* My Recent Issues Section */}
            <View style={styles.issuesSection}>
                <Text style={styles.sectionTitle}>My Recent Issues</Text>

                <FlatList
                    data={issues}
                    renderItem={renderIssueCard}
                    keyExtractor={(item) => item._id || item.id || Math.random().toString()}
                    ListEmptyComponent={renderEmptyState()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16, s
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    welcomeSection: {
        marginBottom: 16,
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: '#666',
    },
    reportButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    reportButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    issuesSection: {
        flex: 1,

    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,

    },
    listContent: {
        paddingBottom: 20,
    },
    issueCard: {
        backgroundColor: '#f492f0',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    issueTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    issueMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
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
    issueDate: {
        fontSize: 12,
        color: '#666',
    },
    emptyState: {
        padding: 32,
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 8,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});

export default HomeScreen;