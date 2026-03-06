'use client';

import DashboardLayout from '@/components/DashboardLayout';
import DashboardProtection from '@/components/DashboardProtection';
import { useUser } from '@/lib/contexts/UserContext';

/* PAGE C5: FO — Profile */

function FOProfileContent() {
    const { user } = useUser();

    if (!user) return null;

    const fields = [
        { label: 'Name', value: user.name || '—' },
        { label: 'Email', value: user.email || '—' },
        { label: 'Role', value: 'Field Officer' },
        { label: 'Department', value: user.department?.name || user.departmentId || '—' },
        { label: 'Ward', value: user.ward || '—' },
        { label: 'Phone', value: user.phone || '—' },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-2xl">
                <div>
                    <h1 className="text-2xl font-bold text-white">Profile</h1>
                    <p className="text-text-secondary text-sm mt-1">Your account information</p>
                </div>

                <div className="bg-card rounded-card border border-border p-6">
                    {/* Avatar + Name */}
                    <div className="flex items-center gap-4 pb-6 border-b border-border">
                        <div className="w-16 h-16 rounded-full bg-gold flex items-center justify-center">
                            <span className="text-black font-bold text-2xl">
                                {(user.name || 'U').charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-white">{user.name}</p>
                            <p className="text-sm text-text-secondary">{user.email}</p>
                        </div>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                        {fields.map(f => (
                            <div key={f.label}>
                                <p className="text-xs text-text-muted uppercase tracking-widest mb-1">{f.label}</p>
                                <p className="text-white font-medium">{f.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default function DepartmentProfile() {
    return (
        <DashboardProtection allowedRoles={['FIELD_OFFICER', 'department']}>
            <FOProfileContent />
        </DashboardProtection>
    );
}
