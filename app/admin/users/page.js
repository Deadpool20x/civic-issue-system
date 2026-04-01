'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import DashboardProtection from '@/components/DashboardProtection'
import toast from 'react-hot-toast'
import { WARD_MAP, DEPARTMENTS, ZONES } from '@/lib/wards'

// Helper Functions
function getRoleLabel(role) {
  const labels = {
    'CITIZEN': 'Citizen',
    'FIELD_OFFICER': 'Field Officer',
    'DEPARTMENT_MANAGER': 'Dept Manager',
    'MUNICIPAL_COMMISSIONER': 'Commissioner',
    'SYSTEM_ADMIN': 'System Admin',
  }
  return labels[role] || role
}

function getRoleBadgeColor(role) {
  if (['CITIZEN'].includes(role)) return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  if (role === 'FIELD_OFFICER') return 'bg-green-500/20 text-green-400 border-green-500/30'
  if (['DEPARTMENT_MANAGER'].includes(role)) return 'bg-teal-500/20 text-teal-400 border-teal-500/30'
  if (['MUNICIPAL_COMMISSIONER'].includes(role)) return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  if (['SYSTEM_ADMIN'].includes(role)) return 'bg-red-500/20 text-red-400 border-red-500/30'
  return 'bg-gray-500/20 text-gray-400'
}

function getAssignmentDisplay(user) {
  if (user.role === 'FIELD_OFFICER' && user.wardId) {
    const ward = WARD_MAP[user.wardId]
    if (ward) {
      const wardNumber = ward.wardNumber
      const zone = ZONES[ward.zone]?.name || ward.zone
      const department = DEPARTMENTS[ward.departmentId]?.name || ward.departmentId
      return `Ward ${wardNumber} · ${zone} · ${department}`
    }
    return `Ward ${user.wardId.replace('ward-', '')}`
  }
  if (user.role === 'DEPARTMENT_MANAGER' && user.departmentId) {
    const dept = DEPARTMENTS[user.departmentId]
    const deptName = dept?.name || user.departmentId
    // Find north and south wards for this department
    const deptWards = Object.values(WARD_MAP).filter(w => w.departmentId === user.departmentId)
    const northWard = deptWards.find(w => w.zone === 'north')?.wardNumber
    const southWard = deptWards.find(w => w.zone === 'south')?.wardNumber
    if (northWard && southWard) {
      return `${deptName} (W${northWard}+W${southWard})`
    }
    return deptName
  }
  return '—'
}

function UsersContent() {
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({ total:0, citizens:0, officers:0, managers:0, commissioners:0, admins:0 })
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const roleFilters = [
    { label: 'All Users', value: '' },
    { label: 'Citizens', value: 'CITIZEN' },
    { label: 'Field Officers', value: 'FIELD_OFFICER' },
    { label: 'Dept Managers', value: 'DEPARTMENT_MANAGER' },
    { label: 'Commissioners', value: 'MUNICIPAL_COMMISSIONER' },
    { label: 'System Admins', value: 'SYSTEM_ADMIN' },
    { label: 'Active Only', value: 'active' },
    { label: 'Inactive Only', value: 'inactive' },
  ]

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const query = new URLSearchParams()
      if (roleFilter) {
        if (roleFilter === 'active' || roleFilter === 'inactive') {
          query.append('status', roleFilter)
        } else {
          query.append('role', roleFilter)
        }
      }
      if (statusFilter && statusFilter !== 'ALL') {
        query.append('status', statusFilter.toLowerCase())
      }

      const [usersRes, statsRes] = await Promise.all([
        fetch(`/api/admin/users?${query.toString()}`),
        fetch('/api/admin/users/stats')
      ])

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(Array.isArray(usersData.data) ? usersData.data : [])
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        if (statsData.success) {
          setStats(statsData.data)
        }
      }
    } catch (err) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [roleFilter, statusFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleToggleStatus = async (id, active) => {
    try {
      const action = active ? 'deactivate' : 'activate'
      const res = await fetch(`/api/admin/users/${id}/${action}`, {
        method: 'PATCH'


      })
      if (!res.ok) throw new Error()
      toast.success('Status updated')
      fetchData()
    } catch { toast.error('Failed') }
  }

  const handleResetPassword = async (userId) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to reset password')

      if (data.temporaryPassword && typeof window !== 'undefined') {
        window.prompt('Temporary password generated. Copy it now:', data.temporaryPassword)
      }

      toast.success(data.emailSent ? 'Password reset email sent' : 'Temporary password generated')
    } catch {
      toast.error('Failed to reset password')
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">User Management</h1>
            <p className="text-text-secondary text-sm mt-1">Manage all system users</p>
          </div>
          <Link href="/admin/users/create" className="btn-gold px-4 py-2 text-sm">+ Create User</Link>
        </div>

        {/* 6 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 stagger-children">
          {[
            { label: 'Total', value: stats.total || 0, color: 'text-white' },
            { label: 'Citizens', value: stats.citizens || 0, color: 'text-blue-400' },
            { label: 'Field Officers', value: stats.officers || 0, color: 'text-green-400' },
            { label: 'Dept Managers', value: stats.managers || 0, color: 'text-teal-400' },
            { label: 'Commissioners', value: stats.commissioners || 0, color: 'text-amber-400' },
            { label: 'Admins', value: stats.admins || 0, color: 'text-red-400' }
          ].map((s, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className={`text-3xl font-black mb-1 ${s.color}`}>{s.value}</div>
              <div className="text-xs text-text-muted uppercase tracking-wider font-bold">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter Bar with Pill Buttons */}
        <div className="bg-card rounded-xl border border-border p-4">
          <label className="text-[10px] text-text-muted uppercase tracking-widest font-black mb-3 block">Filter Users</label>
          <div className="flex flex-wrap gap-2">
            {roleFilters.map(filter => (
              <button
                key={filter.value}
                onClick={() => {
                  if (filter.value === 'active') {
                    setRoleFilter('')
                    setStatusFilter('active')
                  } else if (filter.value === 'inactive') {
                    setRoleFilter('')
                    setStatusFilter('inactive')
                  } else {
                    setRoleFilter(filter.value)
                    setStatusFilter('')
                  }
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors border ${
                  (roleFilter === filter.value || (filter.value === 'active' && statusFilter === 'active') || (filter.value === 'inactive' && statusFilter === 'inactive')) 
                    ? 'bg-white text-black border-white' 
                    : 'bg-[#111] text-[#AAA] border-[#333] hover:bg-[#222] hover:text-white'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {loading ? (
             <div className="flex justify-center py-16">
               <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
             </div>
          ) : (
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#111] border-b border-border">
                      <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-text-muted whitespace-nowrap">Name</th>
                      <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-text-muted whitespace-nowrap">Email</th>
                      <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-text-muted whitespace-nowrap">Role</th>
                      <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-text-muted whitespace-nowrap">Ward / Dept</th>
                      <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-text-muted whitespace-nowrap">Status</th>
                      <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-text-muted whitespace-nowrap">Joined</th>
                      <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-text-muted whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((u, idx) => (
                      <tr key={u._id || idx} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-4 font-bold text-white whitespace-nowrap">{u.name}</td>
                        <td className="px-4 py-4 text-text-muted text-sm whitespace-nowrap">{u.email}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded border text-[10px] font-black uppercase tracking-widest ${getRoleBadgeColor(u.role)}`}>
                            {getRoleLabel(u.role)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-text-muted">
                          {getAssignmentDisplay(u)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded border text-[10px] font-black uppercase tracking-widest ${
                            u.isActive ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'
                          }`}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-text-muted text-sm whitespace-nowrap">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {/* Edit Button */}
                            <Link 
                              href={`/admin/users/${u._id}/edit`}
                              className="text-xs px-3 py-1.5 rounded-full font-bold bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                            >
                              Edit
                            </Link>
                            {/* Reset Password Button */}
                            <button 
                              onClick={() => handleResetPassword(u._id)}
                              className="text-xs px-3 py-1.5 rounded-full font-bold bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                            >
                              Reset Pwd
                            </button>
                            {/* Deactivate/Activate Button */}
                            <button 
                              onClick={() => handleToggleStatus(u._id, u.isActive)}
                              className={`text-xs px-3 py-1.5 rounded-full font-bold transition-colors ${
                                u.isActive ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                              }`}
                            >
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <div className="p-12 flex flex-col items-center justify-center text-center">
                    <span className="text-4xl mb-4 opacity-50">👥</span>
                    <h3 className="text-lg font-bold text-white mb-1">No users found</h3>
                    <p className="text-text-muted text-sm">Try adjusting your filters</p>
                  </div>
                )}
             </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function AdminUsersPage() {
  return (
    <DashboardProtection allowedRoles={['SYSTEM_ADMIN', 'admin']}>
      <UsersContent />
    </DashboardProtection>
  )
}
