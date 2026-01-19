'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import toast from 'react-hot-toast';

export default function AdminDepartments() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newDepartment, setNewDepartment] = useState({
        name: '',
        description: '',
        contactEmail: '',
        contactPhone: ''
    });
    const [formError, setFormError] = useState('');

    const fetchDepartments = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/departments?type=departments');
            if (response.ok) {
                const data = await response.json();
                setDepartments(data);
            } else {
                setError('Failed to fetch departments');
            }
        } catch (err) {
            setError('Error loading departments');
            console.error('Error fetching departments:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    const validateDepartmentName = (name) => {
        // Check minimum length
        if (name.length < 5) {
            return 'Department name too short. Use descriptive name like "Roads Department"';
        }

        // Check if it looks like a person's name (2 words, both capitalized)
        const wordCount = name.trim().split(/\s+/).length;
        const looksLikePersonName = wordCount === 2 &&
            name === name.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

        if (looksLikePersonName) {
            return 'Invalid department name. Must be a department/office name, not a person\'s name';
        }

        // Check for department-related keywords
        const departmentKeywords = ['department', 'dept', 'office', 'administration', 'division', 'bureau'];
        const hasKeyword = departmentKeywords.some(keyword =>
            name.toLowerCase().includes(keyword)
        );

        if (!hasKeyword) {
            return 'Department name must be descriptive (e.g., "Roads & Infrastructure Department")';
        }

        return '';
    };

    const handleCreateDepartment = async (e) => {
        e.preventDefault();

        // Client-side validation
        const validationError = validateDepartmentName(newDepartment.name);
        if (validationError) {
            setFormError(validationError);
            return;
        }

        try {
            const response = await fetch('/api/departments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newDepartment),
            });

            if (response.ok) {
                const department = await response.json();
                setDepartments(prev => [...prev, department]);
                setNewDepartment({
                    name: '',
                    description: '',
                    contactEmail: '',
                    contactPhone: ''
                });
                setShowCreateForm(false);
                setFormError('');
                toast.success('Department created successfully');
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to create department');
                setFormError(errorData.error || '');
            }
        } catch (err) {
            setError('Error creating department');
            console.error('Error creating department:', err);
        }
    };

    const handleDeleteDepartment = async (departmentId) => {
        if (!window.confirm('Are you sure you want to delete this department?')) return;

        try {
            const response = await fetch(`/api/departments/${departmentId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setDepartments(prev => prev.filter(dept => dept._id !== departmentId));
            } else {
                setError('Failed to delete department');
            }
        } catch (err) {
            setError('Error deleting department');
            console.error('Error deleting department:', err);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Department Management</h1>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Add New Department
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {/* Create Department Form */}
                {showCreateForm && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                            <h2 className="text-lg font-semibold mb-4">Create New Department</h2>
                            <form onSubmit={handleCreateDepartment} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g., Roads & Infrastructure Department"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={newDepartment.name}
                                        onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        rows={3}
                                        value={newDepartment.description}
                                        onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                                    <input
                                        type="email"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={newDepartment.contactEmail}
                                        onChange={(e) => setNewDepartment({ ...newDepartment, contactEmail: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                                    <input
                                        type="tel"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={newDepartment.contactPhone}
                                        onChange={(e) => setNewDepartment({ ...newDepartment, contactPhone: e.target.value })}
                                    />
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateForm(false)}
                                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Create Department
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Departments List */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                            All Departments ({departments.length})
                        </h3>

                        {loading ? (
                            <div className="text-center py-4">
                                <div className="text-gray-500">Loading departments...</div>
                            </div>
                        ) : departments.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="text-gray-500">No departments found</div>
                                <button
                                    onClick={() => setShowCreateForm(true)}
                                    className="mt-2 text-blue-600 hover:text-blue-800"
                                >
                                    Create your first department
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Description
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Contact
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {departments.map((department) => (
                                            <tr key={department._id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {department.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">
                                                        {department.description || 'No description'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div>{department.contactEmail}</div>
                                                    <div>{department.contactPhone}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => handleDeleteDepartment(department._id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
