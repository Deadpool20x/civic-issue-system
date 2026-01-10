'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardProtection from '@/components/DashboardProtection';
import toast from 'react-hot-toast';

export default function AdminCreateUserPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'department',
        department: '',
        address: {
            street: '',
            city: '',
            state: '',
            pincode: ''
        }
    });

    // Reset success message after 3 seconds
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            // Prepare payload - only include department if role is department
            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                role: formData.role,
                address: formData.address
            };

            // Add department only if role is department
            if (formData.role === 'department') {
                payload.department = formData.department;
            }

            const response = await fetch('/api/admin/create-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create user');
            }

            // Success - show message and clear form
            setSuccess('Staff user created successfully');
            setFormData({
                name: '',
                email: '',
                password: '',
                phone: '',
                role: 'department',
                department: '',
                address: {
                    street: '',
                    city: '',
                    state: '',
                    pincode: ''
                }
            });
            toast.success('Staff user created successfully');

        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const Content = () => (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-contrast-primary">Create Staff User</h1>
                <p className="text-sm text-contrast-light mt-1">Create department or municipal staff accounts</p>
            </div>

            {/* Success Message */}
            {success && (
                <div className="mb-4 p-3 bg-status-success/10 border border-status-success text-status-success rounded-lg">
                    {success}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 bg-status-error/10 border border-status-error text-status-error rounded-lg">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg border border-neutral-border">
                <div>
                    <label className="block text-sm font-medium text-contrast-secondary mb-1">
                        Name *
                    </label>
                    <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white text-contrast-primary"
                        placeholder="John Doe"
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-contrast-secondary mb-1">
                        Email *
                    </label>
                    <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white text-contrast-primary"
                        placeholder="john@example.com"
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-contrast-secondary mb-1">
                        Password *
                    </label>
                    <input
                        type="password"
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white text-contrast-primary"
                        placeholder="Min. 6 characters"
                        minLength={6}
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-contrast-secondary mb-1">
                        Phone
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white text-contrast-primary"
                        placeholder="+1234567890"
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-contrast-secondary mb-1">
                        Role *
                    </label>
                    <select
                        name="role"
                        required
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white text-contrast-primary"
                        disabled={loading}
                    >
                        <option value="department">Department Staff</option>
                        <option value="municipal">Municipal Staff</option>
                    </select>
                </div>

                {/* Department field - only shown when role is department */}
                {formData.role === 'department' && (
                    <div>
                        <label className="block text-sm font-medium text-contrast-secondary mb-1">
                            Department *
                        </label>
                        <select
                            name="department"
                            required
                            value={formData.department}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white text-contrast-primary"
                            disabled={loading}
                        >
                            <option value="">Select Department</option>
                            <option value="water">Water</option>
                            <option value="electricity">Electricity</option>
                            <option value="roads">Roads</option>
                            <option value="garbage">Garbage</option>
                            <option value="parks">Parks</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                )}

                {/* Address Section */}
                <div className="pt-2 border-t border-neutral-border">
                    <p className="text-sm font-medium text-contrast-secondary mb-3">Address (Optional)</p>
                    <div className="space-y-3">
                        <input
                            type="text"
                            name="address.street"
                            value={formData.address.street}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white text-contrast-primary"
                            placeholder="Street"
                            disabled={loading}
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                name="address.city"
                                value={formData.address.city}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white text-contrast-primary"
                                placeholder="City"
                                disabled={loading}
                            />
                            <input
                                type="text"
                                name="address.state"
                                value={formData.address.state}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white text-contrast-primary"
                                placeholder="State"
                                disabled={loading}
                            />
                        </div>
                        <input
                            type="text"
                            name="address.pincode"
                            value={formData.address.pincode}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white text-contrast-primary"
                            placeholder="PIN Code"
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 border border-neutral-border text-contrast-secondary rounded-lg hover:bg-neutral-bg transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary disabled:opacity-50 font-medium transition-colors"
                    >
                        {loading ? 'Creating...' : 'Create User'}
                    </button>
                </div>
            </form>
        </div>
    );

    return (
        <DashboardProtection requiredRole="admin">
            <DashboardLayout>
                <Content />
            </DashboardLayout>
        </DashboardProtection>
    );
}
