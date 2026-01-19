'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import Card from '@/components/ui/Card';
import toast from 'react-hot-toast';
import { getDepartmentDisplayName } from '@/lib/department-mapper';

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [departments, setDepartments] = useState([]);
    const [loadingDepartments, setLoadingDepartments] = useState(true);
    const [selectedRoles, setSelectedRoles] = useState({});
    const [selectedDepartments, setSelectedDepartments] = useState({});

    const fetchUsers = useCallback(async () => {
        try {
            const response = await fetch('/api/users/admin');
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

    // Fetch departments
    const fetchDepartments = useCallback(async () => {
        try {
            setLoadingDepartments(true);
            const response = await fetch('/api/departments');
            if (!response.ok) {
                throw new Error('Failed to fetch departments');
            }
            const data = await response.json();
            setDepartments(data);
        } catch (error) {
            toast.error('Failed to load departments');
            console.error('Error fetching departments:', error);
        } finally {
            setLoadingDepartments(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
        fetchDepartments();
    }, [fetchUsers, fetchDepartments]);

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
                const error = await response.json();
                throw new Error(error.error || 'Failed to update user status');
            }

            toast.success('User status updated successfully');
            fetchUsers();
        } catch (error) {
            toast.error(error.message || 'Failed to update user status');
            console.error('Error updating user status:', error);
        }
    };

    const handleUpdateUser = async (userId, updates) => {
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update user');
            }

            toast.success('User updated successfully');
            fetchUsers();
        } catch (error) {
            toast.error(error.message || 'Failed to update user');
            console.error('Error updating user:', error);
        }
    };

    const handleRoleChange = (userId, newRole) => {
        const user = users.find(u => u._id === userId);
        if (user.role === 'admin') {
            toast.error('Cannot modify admin role');
            return;
        }

        setSelectedRoles(prev => ({ ...prev, [userId]: newRole }));

        if (newRole !== 'department') {
            setSelectedDepartments(prev => ({ ...prev, [userId]: null }));
            handleUpdateUser(userId, { role: newRole, department: null });
        } else {
            // If changing to department role, require department selection
            const currentDepartment = selectedDepartments[userId] || user.department?._id || user.department;
            if (!currentDepartment) {
                toast.error('Please select a department first');
                return;
            }
            handleUpdateUser(userId, { role: newRole, department: currentDepartment });
        }
    };

    const handleDepartmentChange = (userId, departmentId) => {
        const user = users.find(u => u._id === userId);
        const currentRole = selectedRoles[userId] || user.role;
        
        setSelectedDepartments(prev => ({ ...prev, [userId]: departmentId }));
        
        // If user is (or will be) a department role, update both role and department
        if (currentRole === 'department') {
            handleUpdateUser(userId, { role: 'department', department: departmentId });
        } else {
            handleUpdateUser(userId, { department: departmentId });
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
                        <h1 className="text-2xl font-semibold text-contrast-primary">User Management</h1>
                        <div className="flex gap-3">
                            <Link href="/admin/users/create" className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary font-medium transition-colors">
                                Create Staff User
                            </Link>
                        </div>
                    </div>

                    {/* User Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="bg-neutral-surface">
                            <h3 className="text-lg font-medium text-contrast-primary">Total Users</h3>
                            <p className="mt-2 text-3xl font-semibold text-brand-primary">{users.length}</p>
                        </Card>
                        <Card className="bg-brand-soft/10">
                            <h3 className="text-lg font-medium text-contrast-primary">Citizens</h3>
                            <p className="mt-2 text-3xl font-semibold text-contrast-light">{userStats.citizen || 0}</p>
                        </Card>
                        <Card className="bg-status-success/10">
                            <h3 className="text-lg font-medium text-contrast-primary">Municipal Staff</h3>
                            <p className="mt-2 text-3xl font-semibold text-status-success">{userStats.municipal || 0}</p>
                        </Card>
                        <Card className="bg-status-warning/10">
                            <h3 className="text-lg font-medium text-contrast-primary">Department Staff</h3>
                            <p className="mt-2 text-3xl font-semibold text-status-warning">{userStats.department || 0}</p>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="flex gap-4 p-4">
                        <select
                            className="border border-neutral-border rounded-lg px-3 py-2 bg-neutral-surface text-contrast-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="all">All Users</option>
                            <option value="citizen">Citizens</option>
                            <option value="municipal">Municipal Staff</option>
                            <option value="department">Department Staff</option>
                            <option value="admin">Administrators</option>
                        </select>
                    </Card>

                    {/* Users Table */}
                    <Card className="p-0 overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-contrast-primary mb-4">
                                Users ({filteredUsers.length})
                            </h3>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-neutral-border">
                                    <thead className="bg-neutral-bg">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-contrast-secondary uppercase tracking-wider">
                                                User
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-contrast-secondary uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-contrast-secondary uppercase tracking-wider">
                                                Department
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-contrast-secondary uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-contrast-secondary uppercase tracking-wider">
                                                Created
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-contrast-secondary uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-neutral-surface divide-y divide-neutral-border">
                                        {filteredUsers.map((user) => (
                                            <tr key={user._id} className="hover:bg-neutral-bg/50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-contrast-primary">
                                                            {user.name}
                                                        </div>
                                                        <div className="text-sm text-contrast-light">
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        className="text-xs border border-neutral-border rounded px-2 py-1 bg-neutral-surface text-contrast-secondary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                                        value={selectedRoles[user._id] || user.role}
                                                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                        disabled={user.role === 'admin'}
                                                    >
                                                        <option value="citizen">Citizen</option>
                                                        <option value="municipal">Municipal</option>
                                                        <option value="department">Department</option>
                                                        {user.role === 'admin' && <option value="admin">Admin</option>}
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {(selectedRoles[user._id] === 'department' || user.role === 'department') ? (
                                                        <select
                                                            className="text-xs border border-neutral-border rounded px-2 py-1 bg-neutral-surface text-contrast-secondary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                                            value={selectedDepartments[user._id] || user.department?._id || user.department || ''}
                                                            onChange={(e) => handleDepartmentChange(user._id, e.target.value)}
                                                            disabled={loadingDepartments}
                                                            required={selectedRoles[user._id] === 'department' || user.role === 'department'}
                                                        >
                                                            <option value="">Select</option>
                                                            {departments.map((dept) => (
                                                                <option key={dept._id} value={dept._id}>
                                                                    {getDepartmentDisplayName(dept.name)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <span className="text-sm text-contrast-light">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.isActive
                                                        ? 'bg-status-success/10 text-status-success border border-status-success/30'
                                                        : 'bg-status-error/10 text-status-error border border-status-error/30'
                                                        }`}>
                                                        {user.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-contrast-light">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleToggleStatus(user._id, user.isActive)}
                                                            disabled={user.role === 'admin'}
                                                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${user.isActive
                                                                ? 'bg-status-error/10 text-status-error hover:bg-status-error/20 border border-status-error/30'
                                                                : 'bg-status-success/10 text-status-success hover:bg-status-success/20 border border-status-success/30'
                                                                } ${user.role === 'admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        >
                                                            {user.isActive ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Card>
                </div>
            </ErrorBoundary>
        </DashboardLayout>
    );
}
