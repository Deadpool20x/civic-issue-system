/**
 * My Issues Screen
 * 
 * Citizen view of all reported issues with status-based filtering.
 * Client-side filtering only - single API call on mount.
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

const MyIssuesScreen = ({ navigation }) => {
    const [allIssues, setAllIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');

    // Tab definitions
    const tabs = [
        { id: 'All', label: 'All' },
        { id: 'Reported', label: 'Reported' },
        { id: 'InProgress', label: 'In Progress' },
        { id: 'Resolved', label: 'Resolved' },
    ];

    // Fetch issues once on mount
    useEffect(() => {
        fetchIssues();
    }, []);

    const fetchIssues = async () => {
        try {
            setLoading(true);

            // Log API request
            console.log('Fetching issues from API');

            // Call GET /api/issues/my
            const response = await apiClient.get('/api/issues/my');

            // Log API response
            console.log('Fetch Issues API Response:', response.data);

            // Temporary console log to confirm API call is firing
            console.log('Fetch Issues API call fired successfully');

            // Extract issues array from response
            const issuesData = response.data?.issues || response.data || [];
            setAllIssues(issuesData);
        } catch (err) {
            const errorMessage = err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                'Failed to load issues';

            // Log the error for debugging
            console.error('Fetch Issues Error:', err.response?.data || err.message);

            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Client-side filtering based on active tab
    const getFilteredIssues = () => {
        if (activeTab === 'All') {
            return allIssues;
        }

        // Map tab names to status values
        const statusMap = {
            'Reported': 'Pending',
            'InProgress': 'InProgress',
            'Resolved': 'Resolved',
        };

        const targetStatus = statusMap[activeTab];
        return allIssues.filter(issue => {
            const status = issue.status || 'Pending';
            return status === targetStatus;
        });
    };

    // Handle tab press
    const handleTabPress = (tabId) => {
        setActiveTab(tabId);
    };

    // Handle issue press
    const handleIssuePress = (issueId) => {
        navigation.navigate('IssueDetail', { issueId });
    };

    // Render individual issue card (reused from HomeScreen layout)
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

    // Render empty state for current tab
    const renderEmptyState = () => {
        if (loading) return null;

        const filteredIssues = getFilteredIssues();
        if (filteredIssues.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>
                        No issues in this category
                    </Text>
                </View>
            );
        }
        return null;
    };

    // Render tabs
    const renderTabs = () => {
        return (
            <View style={styles.tabsContainer}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[
                            styles.tabButton,
                            activeTab === tab.id && styles.activeTabButton,
                        ]}
                        onPress={() => handleTabPress(tab.id)}
                        disabled={loading}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === tab.id && styles.activeTabText,
                            ]}
                        >
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    // Get filtered issues for display
    const filteredIssues = getFilteredIssues();

    // Show loading on first load
    if (loading && allIssues.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading your issues...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Tabs */}
            {renderTabs()}

            {/* Issue List */}
            <FlatList
                data={filteredIssues}
                renderItem={renderIssueCard}
                keyExtractor={(item) => item._id || item.id || Math.random().toString()}
                ListEmptyComponent={renderEmptyState()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
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
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    // Tabs
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 6,
        alignItems: 'center',
        marginHorizontal: 2,
    },
    activeTabButton: {
        backgroundColor: '#007AFF',
    },
    tabText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
    },
    activeTabText: {
        color: 'white',
    },
    // List
    listContent: {
        padding: 16,
        paddingBottom: 32,
    },
    // Issue Card (reused from HomeScreen)
    issueCard: {
        backgroundColor: 'white',
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
    // Empty State
    emptyState: {
        padding: 32,
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 8,
        marginTop: 16,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});

export default MyIssuesScreen;