'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import DashboardProtection from '@/components/DashboardProtection'
import { DEPARTMENTS, WARD_MAP, getDepartmentWards } from '@/lib/wards'

const departmentList = Object.values(DEPARTMENTS)

function DepartmentRow({ dept }) {
    const [northOfficer, setNorthOfficer] = useState(null)
    const [southOfficer, setSouthOfficer] = useState(null)
    const [loading, setLoading] = useState(true)

    // Get the ward IDs for this department
    const wardIds = getDepartmentWards(dept.id)
    
    // Get north and south ward data from WARD_MAP
    const northWard = wardIds.find(id => WARD_MAP[id]?.zone === 'north')
    const southWard = wardIds.find(id => WARD_MAP[id]?.zone === 'south')

    // Get ward labels for display
    const northWardLabel = northWard ? `Ward ${WARD_MAP[northWard].wardNumber} — North Zone` : '—'
    const southWardLabel = southWard ? `Ward ${WARD_MAP[southWard].wardNumber} — South Zone` : '—'

    useEffect(() => {
        async function loadOfficers() {
            try {
                const res = await fetch(`/api/admin/users?departmentId=${dept.id}`)
                if (res.ok) {
                    const { users } = await res.json()
                    
                    // Find north officer (wards 1-8)
                    const north = users.find(u => 
                        u.role === 'FIELD_OFFICER' && 
                        u.wardId && 
                        parseInt(u.wardId.replace('ward-', '')) <= 8
                    )
                    
                    // Find south officer (wards 9-16)
                    const south = users.find(u => 
                        u.role === 'FIELD_OFFICER' && 
                        u.wardId && 
                        parseInt(u.wardId.replace('ward-', '')) > 8
                    )

                    if (north) setNorthOfficer(north)
                    if (south) setSouthOfficer(south)
                }
            } catch (err) { }
            finally { setLoading(false) }
        }
        loadOfficers()
    }, [dept.id])

    if (loading) return (
        <tr>
            <td colSpan="5" className="p-4 text-center">
                <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" />
            </td>
        </tr>
    )

    return (
        <tr className="hover:bg-white/5 transition-colors border-b border-white/5">
            <td className="px-4 py-4 font-bold text-white whitespace-nowrap">
                <span className="mr-2">{dept.icon}</span>
                {dept.name}
            </td>
            <td className="px-4 py-4 text-sm text-text-muted">
                {northWardLabel}
            </td>
            <td className="px-4 py-4 text-sm text-text-muted">
                {southWardLabel}
            </td>
            <td className="px-4 py-4 text-sm">
                {northOfficer ? (
                    <span className="text-blue-400">{northOfficer.name}</span>
                ) : (
                    <span className="text-red-400">Vacant</span>
                )}
            </td>
            <td className="px-4 py-4 text-sm">
                {southOfficer ? (
                    <span className="text-blue-400">{southOfficer.name}</span>
                ) : (
                    <span className="text-red-400">Vacant</span>
                )}
            </td>
        </tr>
    )
}

function DepartmentsContent() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Department Structure</h1>
                    <p className="text-text-secondary text-sm mt-1">Read-only view of 8 fixed departments and their assigned officers.</p>
                </div>

                <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#111] border-b border-border">
                                    <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-text-muted">Department</th>
                                    <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-text-muted">North Ward</th>
                                    <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-text-muted">South Ward</th>
                                    <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-text-muted">North Officer</th>
                                    <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-text-muted">South Officer</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departmentList.map(d => <DepartmentRow key={d.id} dept={d} />)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default function AdminDepartmentsPage() {
    return (
        <DashboardProtection allowedRoles={['SYSTEM_ADMIN', 'admin']}>
            <DepartmentsContent />
        </DashboardProtection>
    )
}
