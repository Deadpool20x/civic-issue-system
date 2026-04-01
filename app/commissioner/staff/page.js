// app/commissioner/staff/page.js
'use client'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import DashboardProtection from '@/components/DashboardProtection'
import Link from 'next/link'
import { WARD_MAP, DEPARTMENTS } from '@/lib/wards'
import toast from 'react-hot-toast'

function StaffContent() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('FIELD_OFFICER')

  useEffect(() => { fetchStaff() }, [roleFilter])

  async function fetchStaff() {
    try {
      setLoading(true)
      const res = await fetch(
        `/api/admin/users?role=${roleFilter}`
      )
      const data = await res.json()
      if (data.success) setUsers(data.data || [])
    } catch {
      toast.error('Failed to load staff')
    } finally {
      setLoading(false)
    }
  }

  function getAssignment(user) {
    if (user.role === 'FIELD_OFFICER' && user.wardId) {
      const ward = WARD_MAP[user.wardId]
      if (!ward) return user.wardId
      return `Ward ${ward.wardNumber} · ${
        ward.zone === 'north' ? 'North' : 'South'
      } Zone`
    }
    if (user.role === 'DEPARTMENT_MANAGER' && user.departmentId) {
      return DEPARTMENTS[user.departmentId]?.name || user.departmentId
    }
    return '—'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Staff Overview
          </h1>
          <p className="text-[#AAAAAA] mt-1">
            All active staff members (read-only)
          </p>
        </div>

        {/* Role tabs */}
        <div className="flex gap-2">
          {[
            { value: 'FIELD_OFFICER',       label: 'Field Officers' },
            { value: 'DEPARTMENT_MANAGER',  label: 'Dept Managers' },
          ].map(tab => (
            <button key={tab.value}
              onClick={() => setRoleFilter(tab.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition
                ${roleFilter === tab.value
                  ? 'bg-[#F5A623] text-black'
                  : 'bg-[#1A1A1A] text-[#AAAAAA] border border-[#333]'
                }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Commissioner can CREATE staff */}
        <Link
          href="/commissioner/create-staff"
          className="inline-flex items-center gap-2 bg-[#F5A623] text-black
                     font-bold px-5 py-2.5 rounded-full hover:bg-[#E09010]
                     transition text-sm"
        >
          + Create Staff Account
        </Link>

        {/* Staff list */}
        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => (
              <div key={i}
                className="h-16 bg-[#1A1A1A] rounded-[20px] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="bg-[#1A1A1A] border border-[#333]
                          rounded-[20px] overflow-hidden">
            {users.map((u, i) => (
              <div key={u._id}
                className={`flex items-center justify-between px-6 py-4
                  ${i < users.length - 1 ? 'border-b border-[#222]' : ''}
                  hover:bg-[#222] transition`}>
                <div>
                  <p className="text-white font-medium">{u.name}</p>
                  <p className="text-[#AAAAAA] text-xs mt-0.5">
                    {u.email}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[#AAAAAA] text-sm">
                    {getAssignment(u)}
                  </p>
                  <span className={`text-xs ${
                    u.isActive ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-[#AAAAAA]">No staff found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default function CommissionerStaffPage() {
  return (
    <DashboardProtection allowedRoles={['MUNICIPAL_COMMISSIONER']}>
      <StaffContent />
    </DashboardProtection>
  )
}
