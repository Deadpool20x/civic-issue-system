'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { DEPARTMENTS, WARD_MAP } from '@/lib/wards';

const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Low', color: 'bg-green-500/20 text-green-400 border-green-500/40', icon: '🟢' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40', icon: '🟡' },
    { value: 'high', label: 'High', color: 'bg-orange-500/20 text-orange-400 border-orange-500/40', icon: '🟠' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-500/20 text-red-400 border-red-500/40', icon: '🔴' },
];

export default function IssueManagementPanel({ issue, currentUser, onUpdate }) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [showDepartmentModal, setShowDepartmentModal] = useState(false);
    const [showPriorityModal, setShowPriorityModal] = useState(false);

    // Reassignment state
    const [selectedWard, setSelectedWard] = useState(issue.ward || '');
    const [selectedOfficer, setSelectedOfficer] = useState(null);
    const [officers, setOfficers] = useState([]);
    const [loadingOfficers, setLoadingOfficers] = useState(false);
    const [reassignComment, setReassignComment] = useState('');

    // Department change state
    const [selectedDepartment, setSelectedDepartment] = useState(issue.assignedDepartment || '');
    const [deptChangeComment, setDeptChangeComment] = useState('');

    // Priority change state
    const [selectedPriority, setSelectedPriority] = useState(issue.priority || 'medium');
    const [priorityComment, setPriorityComment] = useState('');

    // Check if user can manage issues (reassign, change dept, etc.)
    const canManageIssues = () => {
        console.log('[IssueManagementPanel] Checking permissions...');
        console.log('[IssueManagementPanel] currentUser:', currentUser);
        console.log('[IssueManagementPanel] currentUser.role:', currentUser?.role);

        if (!currentUser) {
            console.log('[IssueManagementPanel] No currentUser - returning false');
            return false;
        }

        // Department Managers can manage issues in their department
        if (currentUser.role === 'DEPARTMENT_MANAGER' || currentUser.role === 'municipal') {
            console.log('[IssueManagementPanel] User is Department Manager - returning true');
            return true;
        }

        // Commissioners and Admins can manage all issues
        if (['MUNICIPAL_COMMISSIONER', 'SYSTEM_ADMIN', 'commissioner', 'admin'].includes(currentUser.role)) {
            console.log('[IssueManagementPanel] User is Commissioner/Admin - returning true');
            return true;
        }

        console.log('[IssueManagementPanel] User role not authorized - returning false');
        return false;
    };

    // Get allowed wards based on user role
    const getAllowedWards = () => {
        if (!currentUser) return [];

        // Commissioner and Admin can access all wards
        if (['MUNICIPAL_COMMISSIONER', 'SYSTEM_ADMIN', 'commissioner', 'admin'].includes(currentUser.role)) {
            return Object.values(WARD_MAP);
        }

        // Department Manager can only access wards in their department
        if (currentUser.role === 'DEPARTMENT_MANAGER' || currentUser.role === 'municipal') {
            const userDepartmentId = currentUser.departmentId;
            if (!userDepartmentId) return [];

            // Filter wards that belong to this department
            return Object.values(WARD_MAP).filter(ward => ward.departmentId === userDepartmentId);
        }

        return [];
    };

    const allowedWards = getAllowedWards();

    // Fetch officers for selected ward
    useEffect(() => {
        if (selectedWard && showReassignModal) {
            fetchOfficersForWard(selectedWard);
        }
    }, [selectedWard, showReassignModal]);

    const fetchOfficersForWard = async (wardId) => {
        setLoadingOfficers(true);
        try {
            const res = await fetch(`/api/admin/users?role=FIELD_OFFICER&wardId=${wardId}`);
            if (res.ok) {
                const data = await res.json();
                setOfficers(data.data || data.users || []);
            }
        } catch (error) {
            console.error('Error fetching officers:', error);
            toast.error('Failed to load officers');
        } finally {
            setLoadingOfficers(false);
        }
    };

    const handleReassign = async () => {
        if (!selectedWard) {
            toast.error('Please select a ward');
            return;
        }

        setIsUpdating(true);
        try {
            const updateData = {
                ward: selectedWard,
                assignedTo: selectedOfficer || null,
                status: 'assigned', // Reset to assigned when reassigning
                comment: reassignComment || `Issue reassigned to ${WARD_MAP[selectedWard]?.wardNumber ? `Ward ${WARD_MAP[selectedWard].wardNumber}` : selectedWard}`
            };

            const res = await fetch(`/api/issues/${issue._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to reassign issue');
            }

            const updatedIssue = await res.json();
            toast.success('Issue reassigned successfully');
            setShowReassignModal(false);
            setReassignComment('');

            if (onUpdate) {
                onUpdate(updatedIssue);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to reassign issue');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDepartmentChange = async () => {
        if (!selectedDepartment) {
            toast.error('Please select a department');
            return;
        }

        setIsUpdating(true);
        try {
            const updateData = {
                assignedDepartment: selectedDepartment,
                status: 'pending', // Reset to pending when changing department
                assignedTo: null, // Clear officer assignment
                comment: deptChangeComment || `Department changed to ${DEPARTMENTS[selectedDepartment]?.name || selectedDepartment}`
            };

            const res = await fetch(`/api/issues/${issue._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to change department');
            }

            const updatedIssue = await res.json();
            toast.success('Department changed successfully');
            setShowDepartmentModal(false);
            setDeptChangeComment('');

            if (onUpdate) {
                onUpdate(updatedIssue);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to change department');
        } finally {
            setIsUpdating(false);
        }
    };

    const handlePriorityChange = async () => {
        if (selectedPriority === issue.priority) {
            toast.error('Priority is already set to this value');
            return;
        }

        setIsUpdating(true);
        try {
            const updateData = {
                priority: selectedPriority,
                comment: priorityComment || `Priority changed to ${selectedPriority}`
            };

            const res = await fetch(`/api/issues/${issue._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to change priority');
            }

            const updatedIssue = await res.json();
            toast.success('Priority updated successfully');
            setShowPriorityModal(false);
            setPriorityComment('');

            if (onUpdate) {
                onUpdate(updatedIssue);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to change priority');
        } finally {
            setIsUpdating(false);
        }
    };

    if (!canManageIssues()) {
        return null; // Don't show for Field Officers and Citizens
    }

    const currentWard = WARD_MAP[issue.ward];
    const currentDept = DEPARTMENTS[issue.assignedDepartment];
    const isDepartmentManager = currentUser?.role === 'DEPARTMENT_MANAGER' || currentUser?.role === 'municipal';
    const userDepartment = isDepartmentManager ? DEPARTMENTS[currentUser?.departmentId] : null;

    return (
        <div className="bg-card rounded-card border border-border p-6">
            <h3 className="text-lg font-bold text-white mb-4">
                🔧 Issue Management
                <span className="ml-2 text-xs font-normal text-text-muted">(Manager/Commissioner Only)</span>
            </h3>

            {/* Department Manager Restriction Notice */}
            {isDepartmentManager && userDepartment && (
                <div className="mb-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm text-blue-400">
                    ℹ️ You can only reassign issues within your department: <span className="font-bold">{userDepartment.name}</span> (Wards {allowedWards.map(w => w.wardNumber).join(', ')})
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Reassign to Different Ward/Officer */}
                <button
                    onClick={() => setShowReassignModal(true)}
                    className="p-4 bg-background hover:bg-white/5 border border-border hover:border-gold/50 rounded-xl transition-all text-left"
                >
                    <div className="text-2xl mb-2">👤</div>
                    <div className="text-sm font-bold text-white mb-1">Reassign Officer</div>
                    <div className="text-xs text-text-muted">
                        Current: {currentWard ? `Ward ${currentWard.wardNumber}` : 'Unassigned'}
                    </div>
                </button>

                {/* Change Department */}
                <button
                    onClick={() => setShowDepartmentModal(true)}
                    className="p-4 bg-background hover:bg-white/5 border border-border hover:border-gold/50 rounded-xl transition-all text-left"
                >
                    <div className="text-2xl mb-2">🏢</div>
                    <div className="text-sm font-bold text-white mb-1">Change Department</div>
                    <div className="text-xs text-text-muted">
                        Current: {currentDept?.name || 'Unassigned'}
                    </div>
                </button>

                {/* Change Priority */}
                <button
                    onClick={() => setShowPriorityModal(true)}
                    className="p-4 bg-background hover:bg-white/5 border border-border hover:border-gold/50 rounded-xl transition-all text-left"
                >
                    <div className="text-2xl mb-2">⚡</div>
                    <div className="text-sm font-bold text-white mb-1">Change Priority</div>
                    <div className="text-xs text-text-muted capitalize">
                        Current: {issue.priority}
                    </div>
                </button>
            </div>

            {/* Reassign Modal */}
            {showReassignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-card border border-border rounded-card max-w-lg w-full p-6 animate-fade-in">
                        <h3 className="text-xl font-bold text-white mb-4">Reassign Issue</h3>

                        <div className="space-y-4">
                            {/* Ward Selection */}
                            <div>
                                <label className="text-xs text-text-secondary uppercase tracking-widest mb-2 block font-medium">
                                    Select Ward
                                    {currentUser.role === 'DEPARTMENT_MANAGER' && (
                                        <span className="ml-2 text-amber-400 text-[10px]">
                                            (Only wards in your department)
                                        </span>
                                    )}
                                </label>
                                <select
                                    value={selectedWard}
                                    onChange={(e) => setSelectedWard(e.target.value)}
                                    className="w-full bg-input border border-border rounded-input text-white px-4 py-3 focus:border-gold focus:outline-none"
                                >
                                    <option value="">Choose a ward...</option>
                                    {allowedWards.map(ward => (
                                        <option key={ward.wardId} value={ward.wardId}>
                                            Ward {ward.wardNumber} - {ward.zone === 'north' ? 'North' : 'South'} Zone - {DEPARTMENTS[ward.departmentId]?.name}
                                        </option>
                                    ))}
                                </select>
                                {allowedWards.length === 0 && (
                                    <div className="mt-2 text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                        ⚠️ No wards available. Contact administrator.
                                    </div>
                                )}
                            </div>

                            {/* Officer Selection */}
                            {selectedWard && (
                                <div>
                                    <label className="text-xs text-text-secondary uppercase tracking-widest mb-2 block font-medium">
                                        Assign to Officer (Optional)
                                    </label>
                                    {loadingOfficers ? (
                                        <div className="text-text-muted text-sm">Loading officers...</div>
                                    ) : officers.length > 0 ? (
                                        <select
                                            value={selectedOfficer || ''}
                                            onChange={(e) => setSelectedOfficer(e.target.value || null)}
                                            className="w-full bg-input border border-border rounded-input text-white px-4 py-3 focus:border-gold focus:outline-none"
                                        >
                                            <option value="">Auto-assign to ward officer</option>
                                            {officers.map(officer => (
                                                <option key={officer._id} value={officer._id}>
                                                    {officer.name} ({officer.email})
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="text-amber-400 text-sm bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                                            ⚠️ No officer assigned to this ward yet
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Comment */}
                            <div>
                                <label className="text-xs text-text-secondary uppercase tracking-widest mb-2 block font-medium">
                                    Reason for Reassignment
                                </label>
                                <textarea
                                    value={reassignComment}
                                    onChange={(e) => setReassignComment(e.target.value)}
                                    placeholder="e.g., Original officer unavailable, better suited for this ward..."
                                    rows={3}
                                    className="w-full bg-input border border-border rounded-input text-white placeholder:text-text-muted px-4 py-3 focus:border-gold focus:outline-none resize-none"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handleReassign}
                                    disabled={isUpdating || !selectedWard}
                                    className="flex-1 btn-gold py-3 text-sm font-bold disabled:opacity-50"
                                >
                                    {isUpdating ? 'Reassigning...' : 'Reassign Issue'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowReassignModal(false);
                                        setReassignComment('');
                                        setSelectedWard(issue.ward || '');
                                        setSelectedOfficer(null);
                                    }}
                                    disabled={isUpdating}
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-full text-sm font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Department Change Modal */}
            {showDepartmentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-card border border-border rounded-card max-w-lg w-full p-6 animate-fade-in">
                        <h3 className="text-xl font-bold text-white mb-4">Change Department</h3>

                        <div className="space-y-4">
                            {/* Department Selection */}
                            <div>
                                <label className="text-xs text-text-secondary uppercase tracking-widest mb-2 block font-medium">
                                    Select Department
                                </label>
                                <select
                                    value={selectedDepartment}
                                    onChange={(e) => setSelectedDepartment(e.target.value)}
                                    className="w-full bg-input border border-border rounded-input text-white px-4 py-3 focus:border-gold focus:outline-none"
                                >
                                    <option value="">Choose a department...</option>
                                    {Object.values(DEPARTMENTS).map(dept => (
                                        <option key={dept.id} value={dept.id}>
                                            {dept.icon} {dept.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Warning */}
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm text-amber-400">
                                ⚠️ Changing department will reset status to "Pending" and clear officer assignment
                            </div>

                            {/* Comment */}
                            <div>
                                <label className="text-xs text-text-secondary uppercase tracking-widest mb-2 block font-medium">
                                    Reason for Change
                                </label>
                                <textarea
                                    value={deptChangeComment}
                                    onChange={(e) => setDeptChangeComment(e.target.value)}
                                    placeholder="e.g., Issue incorrectly categorized, should be handled by different department..."
                                    rows={3}
                                    className="w-full bg-input border border-border rounded-input text-white placeholder:text-text-muted px-4 py-3 focus:border-gold focus:outline-none resize-none"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handleDepartmentChange}
                                    disabled={isUpdating || !selectedDepartment}
                                    className="flex-1 btn-gold py-3 text-sm font-bold disabled:opacity-50"
                                >
                                    {isUpdating ? 'Changing...' : 'Change Department'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDepartmentModal(false);
                                        setDeptChangeComment('');
                                        setSelectedDepartment(issue.assignedDepartment || '');
                                    }}
                                    disabled={isUpdating}
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-full text-sm font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Priority Change Modal */}
            {showPriorityModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-card border border-border rounded-card max-w-lg w-full p-6 animate-fade-in">
                        <h3 className="text-xl font-bold text-white mb-4">Change Priority</h3>

                        <div className="space-y-4">
                            {/* Priority Selection */}
                            <div>
                                <label className="text-xs text-text-secondary uppercase tracking-widest mb-2 block font-medium">
                                    Select Priority Level
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {PRIORITY_OPTIONS.map(option => (
                                        <button
                                            key={option.value}
                                            onClick={() => setSelectedPriority(option.value)}
                                            className={`p-4 rounded-xl border-2 transition-all ${selectedPriority === option.value
                                                ? 'border-gold bg-gold/10'
                                                : 'border-border hover:border-gold/50 hover:bg-white/5'
                                                }`}
                                        >
                                            <div className="text-2xl mb-2">{option.icon}</div>
                                            <div className="text-sm font-bold text-white">{option.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Comment */}
                            <div>
                                <label className="text-xs text-text-secondary uppercase tracking-widest mb-2 block font-medium">
                                    Reason for Priority Change
                                </label>
                                <textarea
                                    value={priorityComment}
                                    onChange={(e) => setPriorityComment(e.target.value)}
                                    placeholder="e.g., Escalating due to public safety concern, multiple complaints received..."
                                    rows={3}
                                    className="w-full bg-input border border-border rounded-input text-white placeholder:text-text-muted px-4 py-3 focus:border-gold focus:outline-none resize-none"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handlePriorityChange}
                                    disabled={isUpdating}
                                    className="flex-1 btn-gold py-3 text-sm font-bold disabled:opacity-50"
                                >
                                    {isUpdating ? 'Updating...' : 'Update Priority'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowPriorityModal(false);
                                        setPriorityComment('');
                                        setSelectedPriority(issue.priority || 'medium');
                                    }}
                                    disabled={isUpdating}
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-full text-sm font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
