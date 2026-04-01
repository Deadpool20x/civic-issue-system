'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import DashboardProtection from '@/components/DashboardProtection'
import toast from 'react-hot-toast'

function UserEditContent() {
  const params = useParams()
  const router = useRouter()
  const userId = params?.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    isActive: true,
  })
  const [userMeta, setUserMeta] = useState({
    role: '',
    wardId: '',
    departmentId: '',
  })

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`/api/users/${userId}`, {
          cache: 'no-store',
        })
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Failed to load user')
        }

        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          isActive: data.isActive ?? true,
        })
        setUserMeta({
          role: data.role || '',
          wardId: data.wardId || '',
          departmentId: data.departmentId || '',
        })
      } catch (error) {
        toast.error(error.message || 'Failed to load user')
        router.replace('/admin/users')
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUser()
    }
  }, [router, userId])

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update user')
      }

      toast.success('User updated successfully')
      router.push('/admin/users')
    } catch (error) {
      toast.error(error.message || 'Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Edit User</h1>
            <p className="text-text-secondary text-sm mt-1">Update core account details</p>
          </div>
          <Link
            href="/admin/users"
            className="px-4 py-2 rounded-full text-sm font-bold bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white transition-colors"
          >
            Back
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider font-bold mb-2 block">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(event) => setFormData(prev => ({ ...prev, name: event.target.value }))}
                className="w-full bg-input border border-border rounded-input text-white px-4 py-3 focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider font-bold mb-2 block">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(event) => setFormData(prev => ({ ...prev, email: event.target.value }))}
                className="w-full bg-input border border-border rounded-input text-white px-4 py-3 focus:border-gold focus:outline-none"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider font-bold mb-2 block">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(event) => setFormData(prev => ({ ...prev, phone: event.target.value }))}
                className="w-full bg-input border border-border rounded-input text-white px-4 py-3 focus:border-gold focus:outline-none"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider font-bold mb-2 block">Status</label>
              <select
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(event) => setFormData(prev => ({ ...prev, isActive: event.target.value === 'active' }))}
                className="w-full bg-input border border-border rounded-input text-white px-4 py-3 focus:border-gold focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-[#111] border border-border rounded-xl p-4">
              <div className="text-[10px] text-text-muted uppercase tracking-widest font-black mb-1">Role</div>
              <div className="text-white text-sm font-medium">{userMeta.role || '—'}</div>
            </div>
            <div className="bg-[#111] border border-border rounded-xl p-4">
              <div className="text-[10px] text-text-muted uppercase tracking-widest font-black mb-1">Ward</div>
              <div className="text-white text-sm font-medium">{userMeta.wardId || '—'}</div>
            </div>
            <div className="bg-[#111] border border-border rounded-xl p-4">
              <div className="text-[10px] text-text-muted uppercase tracking-widest font-black mb-1">Department</div>
              <div className="text-white text-sm font-medium">{userMeta.departmentId || '—'}</div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-gold w-full py-3 text-base"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  )
}

export default function AdminUserEditPage() {
  return (
    <DashboardProtection allowedRoles={['SYSTEM_ADMIN', 'admin']}>
      <UserEditContent />
    </DashboardProtection>
  )
}
