'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const fetchUsers = useCallback(async () => {
        try {
            // This would be a new API endpoint for admin to get all users
            const response = await fetch('/api/users');
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            toast.error('Failed to load users');
            console.error('Error fetching users:', error);
            // Fallback: Create sample data for demonstration
            setUsers([
                {
                    _id: '1',
                    name: 'John Doe',
                    email: 'john@example.com',
                    role: 'citizen',
                    isActive: true,
                    createdAt: new Date().toISOString()
                },
                {
                    _id: '2',
                    name: 'Jane Smith',
                    email: 'jane@municipal.gov',
                    role: 'municipal',
                    isActive: true,
                    createdAt: new Date().toISOString()
                }
            ]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const filteredUsers = users.filter(user => {
        if (filter === 'all') return true;
        return user.role === filter;
    });

    const getUserStats = () => {
        return users.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
        }, {});
    };

    const userStats = getUserStats();

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isActive: !currentStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update user status');
            }

            toast.success('User status updated successfully');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to update user status');
            console.error('Error updating user status:', error);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-600">Loading...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <ErrorBoundary>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
                    </div>

                    {/* User Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg shadow p-4">
                            <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
                            <p className="mt-2 text-3xl font-semibold">{users.length}</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg shadow p-4">
                            <h3 className="text-lg font-medium text-blue-800">Citizens</h3>
                            <p className="mt-2 text-3xl font-semibold">{userStats.citizen || 0}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg shadow p-4">
                            <h3 className="text-lg font-medium text-green-800">Municipal Staff</h3>
                            <p className="mt-2 text-3xl font-semibold">{userStats.municipal || 0}</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg shadow p-4">
                            <h3 className="text-lg font-medium text-purple-800">Department Staff</h3>
                            <p className="mt-2 text-3xl font-semibold">{userStats.department || 0}</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-4 bg-white p-4 rounded-lg shadow">
                        <select
                            className="border rounded-md px-3 py-2"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="all">All Users</option>
                            <option value="citizen">Citizens</option>
                            <option value="municipal">Municipal Staff</option>
                            <option value="department">Department Staff</option>
                            <option value="admin">Administrators</option>
                        </select>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Users ({filteredUsers.length})
                            </h3>
                            
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Created
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredUsers.map((user) => (
                                            <tr key={user._id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {user.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize
                                                        ${user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                                          user.role === 'municipal' ? 'bg-green-100 text-green-800' :
                                                          user.role === 'department' ? 'bg-purple-100 text-purple-800' :
                                                          'bg-blue-100 text-blue-800'}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        user.isActive
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {user.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => handleToggleStatus(user._id, user.isActive)}
                                                        className={`px-3 py-1 rounded text-xs font-medium ${
                                                            user.isActive
                                                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        }`}
                                                    >
                                                        {user.isActive ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </ErrorBoundary>
        </DashboardLayout>
    );
}