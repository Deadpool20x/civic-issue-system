'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import { toast } from 'react-hot-toast';

const ROLES = [
    { value: 'CITIZEN', label: 'Citizen' },
    { value: 'FIELD_OFFICER', label: 'Field Officer' },
    { value: 'DEPARTMENT_MANAGER', label: 'Department Manager' },
    { value: 'MUNICIPAL_COMMISSIONER', label: 'Municipal Commissioner' }
];

const DEPARTMENTS = [
    { value: 'roads', label: 'Roads & Infrastructure' },
    { value: 'water', label: 'Water & Drainage' },
    { value: 'waste', label: 'Waste Management' },
    { value: 'lighting', label: 'Street Lighting' },
    { value: 'parks', label: 'Parks & Public Spaces' },
    { value: 'traffic', label: 'Traffic & Signage' },
    { value: 'health', label: 'Public Health & Safety' }
];

export default function CreateUserPage() {
    const router = useRouter();
    const [wards, setWards] = useState([]);
    const [loadingWards, setLoadingWards] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'CITIZEN',
        wardId: '',
        departmentId: '',
    });

    useEffect(() => {
        const fetchWards = async () => {
            try {
                const res = await fetch('/api/wards');
                if (res.ok) {
                    const data = await res.json();
                    setWards(data.all || []);
                }
            } catch (err) {
                console.error('Failed to fetch wards:', err);
            } finally {
                setLoadingWards(false);
            }
        };
        fetchWards();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch('/api/admin/create-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Account created successfully');
                router.push('/admin/users');
            } else {
                toast.error(data.error || 'Failed to create account');
            }
        } catch (err) {
            toast.error('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const isOfficer = formData.role === 'FIELD_OFFICER';
    const isManager = formData.role === 'DEPARTMENT_MANAGER';

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <PageHeader
                title="Create Account"
                subtitle="Provision a new account for citizens or municipal staff."
            />

            <form onSubmit={handleSubmit} className="card space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label>Full Name</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Rahul Sharma"
                            className="w-full"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label>Email Address</label>
                        <input
                            type="email"
                            required
                            placeholder="r.sharma@civicpulse.in"
                            className="w-full"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label>Temporary Password</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label>Role</label>
                        <select
                            className="w-full"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value, wardId: '', departmentId: '' })}
                        >
                            {ROLES.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* ── CONDITIONAL FIELDS ── */}
                <div className={`space-y-6 overflow-hidden transition-all duration-300 ${(isOfficer || isManager) ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                    <div className="h-px bg-border my-6" />

                    <div className="grid md:grid-cols-2 gap-6">
                        {isOfficer && (
                            <div className="space-y-1.5">
                                <label>Assigned Ward</label>
                                <select
                                    required={isOfficer}
                                    className="w-full"
                                    value={formData.wardId}
                                    onChange={(e) => setFormData({ ...formData, wardId: e.target.value })}
                                >
                                    <option value="">Select Ward</option>
                                    {wards.map(w => (
                                        <option key={w.wardId} value={w.wardId}>{w.wardName} ({w.zone})</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {(isOfficer || isManager) && (
                            <div className="space-y-1.5">
                                <label>Department</label>
                                <select
                                    required={isOfficer || isManager}
                                    className="w-full"
                                    value={formData.departmentId}
                                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                >
                                    <option value="">Select Department</option>
                                    {DEPARTMENTS.map(d => (
                                        <option key={d.value} value={d.value}>{d.label}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="btn-gold w-full py-3 h-12"
                    >
                        {submitting ? (
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : 'Create Account'}
                    </button>
                </div>
            </form>
        </div>
    );
}
