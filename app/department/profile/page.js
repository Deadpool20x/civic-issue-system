'use client';

import { useState, useEffect } from 'react';

export default function DepartmentProfile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            try {
                const response = await fetch('/api/auth/me');
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchUser();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Profile Settings</h1>
            <p className="text-gray-600 mb-6">Manage your profile information</p>
            
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-2xl">
                <div className="space-y-4">
                    <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold">
                            {user?.name?.charAt(0)?.toUpperCase() || 'D'}
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-gray-900">{user?.name || 'Department Staff'}</p>
                            <p className="text-sm text-gray-500">{user?.email || 'N/A'}</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Role</p>
                            <p className="font-medium text-gray-900 capitalize">{user?.role || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Department</p>
                            <p className="font-medium text-gray-900">{user?.department?.name || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Edit Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
