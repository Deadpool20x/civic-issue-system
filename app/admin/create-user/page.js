'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardProtection from '@/components/DashboardProtection';
import PageHeader from '@/components/PageHeader';
import toast from 'react-hot-toast';
import { DEPARTMENTS, WARD_MAP } from '@/lib/wards';

function CreateUserContent() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: '',
        wardId: '',
        departmentId: ''
    });

    const inputCls = "bg-input border border-border rounded-input text-white placeholder:text-text-muted px-4 py-3 focus:border-gold focus:outline-none w-full";
    const labelCls = "block text-sm font-medium text-white mb-2";

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        if (formData.role === 'FIELD_OFFICER' && !formData.wardId) {
            toast.error('Please select a ward for Field Officer');
            return;
        }

        if (formData.role === 'DEPARTMENT_MANAGER' && !formData.departmentId) {
            toast.error('Please select a department for Department Manager');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                role: formData.role,
                isActive: true
            };

            if (formData.role === 'FIELD_OFFICER') {
                payload.wardId = formData.wardId;
            }

            if (formData.role === 'DEPARTMENT_MANAGER') {
                payload.departmentId = formData.departmentId;
            }

            const res = await fetch('/api/users/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('User account created successfully');
                router.push('/admin/users');
            } else {
                toast.error(data.error || 'Failed to create account');
            }
        } catch (error) {
            console.error('Create user error:', error);
            toast.error('Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    // Get ward info for display
    const selectedWard = formData.wardId ? WARD_MAP[formData.wardId] : null;
    const selectedDept = formData.departmentId ? DEPARTMENTS[formData.departmentId] : null;

    // Group wards by zone for dropdown
    const northWards = Object.values(WARD_MAP).filter(w => w.zone === 'north');
    const southWards = Object.values(WARD_MAP).filter(w => w.zone === 'south');

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
                <PageHeader
                    title="Create User Account"
                    subtitle="Create accounts for all roles: Citizens, Officers, Managers, Commissioners, and Admins"
                />

                <form onSubmit={handleSubmit} className="card space-y-6">
                    {/* Role Selection */}
                    <div>
                        <label className={labelCls}>Role *</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                            className={inputCls}
                        >
                            <option value="">Select Role</option>
                            <option value="CITIZEN">Citizen</option>
                            <option value="FIELD_OFFICER">Field Officer</option>
                            <option value="DEPARTMENT_MANAGER">Department Manager</option>
                            <option value="MUNICIPAL_COMMISSIONER">Municipal Commissioner</option>
                            <option value="SYSTEM_ADMIN">System Admin</option>
                        </select>
                    </div>

                    {/* Basic Info */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelCls}>Full Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Enter full name"
                                className={inputCls}
                            />
                        </div>

                        <div>
                            <label className={labelCls}>Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="email@example.com"
                                className={inputCls}
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelCls}>Phone (Optional)</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+91 XXXXX XXXXX"
                            className={inputCls}
                        />
                    </div>

                    {/* Password */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelCls}>Password *</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                                placeholder="Min 6 characters"
                                className={inputCls}
                            />
                        </div>

                        <div>
                            <label className={labelCls}>Confirm Password *</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                minLength={6}
                                placeholder="Re-enter password"
                                className={inputCls}
                            />
                        </div>
                    </div>

                    {/* Field Officer - Ward Selection */}
                    {formData.role === 'FIELD_OFFICER' && (
                        <div>
                            <label className={labelCls}>Assign to Ward *</label>
                            <select
                                name="wardId"
                                value={formData.wardId}
                                onChange={handleChange}
                                required
                                className={inputCls}
                            >
                                <option value="">Select Ward</option>
                                <optgroup label="── NORTH ZONE ──">
                                    {northWards.map(ward => (
                                        <option key={ward.wardId} value={ward.wardId}>
                                            Ward {ward.wardNumber} — {DEPARTMENTS[ward.departmentId].name}
                                        </option>
                                    ))}
                                </optgroup>
                                <optgroup label="── SOUTH ZONE ──">
                                    {southWards.map(ward => (
                                        <option key={ward.wardId} value={ward.wardId}>
                                            Ward {ward.wardNumber} — {DEPARTMENTS[ward.departmentId].name}
                                        </option>
                                    ))}
                                </optgroup>
                            </select>

                            {selectedWard && (
                                <div className="mt-3 p-3 bg-card-hover rounded-lg text-sm">
                                    <p className="text-text-secondary">
                                        <span className="text-gold font-medium">Zone:</span> {selectedWard.zone === 'north' ? 'North Zone' : 'South Zone'}
                                    </p>
                                    <p className="text-text-secondary">
                                        <span className="text-gold font-medium">Department:</span> {DEPARTMENTS[selectedWard.departmentId].name}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Department Manager - Department Selection */}
                    {formData.role === 'DEPARTMENT_MANAGER' && (
                        <div>
                            <label className={labelCls}>Assign to Department *</label>
                            <select
                                name="departmentId"
                                value={formData.departmentId}
                                onChange={handleChange}
                                required
                                className={inputCls}
                            >
                                <option value="">Select Department</option>
                                {Object.entries(DEPARTMENTS).map(([id, dept]) => (
                                    <option key={id} value={id}>
                                        {dept.icon} {dept.name}
                                    </option>
                                ))}
                            </select>

                            {selectedDept && formData.departmentId && (
                                <div className="mt-3 p-3 bg-card-hover rounded-lg text-sm">
                                    <p className="text-text-secondary mb-2">
                                        <span className="text-gold font-medium">Manages:</span>
                                    </p>
                                    {Object.values(WARD_MAP)
                                        .filter(w => w.departmentId === formData.departmentId)
                                        .map(ward => (
                                            <p key={ward.wardId} className="text-text-secondary text-xs">
                                                • Ward {ward.wardNumber} ({ward.zone === 'north' ? 'North' : 'South'} Zone)
                                            </p>
                                        ))
                                    }
                                </div>
                            )}
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="btn-outline flex-1"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-gold flex-1"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Account'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}

export default function AdminCreateUserPage() {
    return (
        <DashboardProtection allowedRoles={['SYSTEM_ADMIN', 'admin']}>
            <CreateUserContent />
        </DashboardProtection>
    );
}
