import { getDepartmentWards, getWardDepartment } from './wards'

// Normalize role for consistent comparison
function normalizeRole(role) {
    if (!role) return null;
    const upperRole = role.toUpperCase();
    
    // Map various role formats to standard names
    const roleMap = {
        'CITIZEN': 'CITIZEN',
        'FIELD_OFFICER': 'FIELD_OFFICER',
        'DEPARTMENT_MANAGER': 'DEPARTMENT_MANAGER',
        'DEPARTMENT': 'DEPARTMENT_MANAGER',  // Handle lowercase 'department'
        'MUNICIPAL_COMMISSIONER': 'MUNICIPAL_COMMISSIONER',
        'COMMISSIONER': 'MUNICIPAL_COMMISSIONER',  // Handle 'commissioner'
        'MUNICIPAL': 'MUNICIPAL_COMMISSIONER',  // Handle 'municipal'
        'SYSTEM_ADMIN': 'SYSTEM_ADMIN',
        'ADMIN': 'SYSTEM_ADMIN',  // Handle 'admin'
    };
    
    return roleMap[upperRole] || null;
}

export function getRoleFilter(user) {
    if (!user) return null

    const role = normalizeRole(user.role)

    // ─── CITIZEN ───────────────────────────────────────
    // Sees only their own reported issues
    if (role === 'CITIZEN') {
        return { reportedBy: user.userId }
    }

    // ─── FIELD OFFICER ─────────────────────────────────
    // Sees issues in their ONE ward only
    if (role === 'FIELD_OFFICER') {
        if (!user.wardId) {
            console.warn('[roleFilter] FIELD_OFFICER has no wardId assigned, returning empty result')
            return { _id: null } // return empty result set
        }
        return { ward: user.wardId }
    }

    // ─── DEPARTMENT MANAGER ────────────────────────────
    if (role === 'DEPARTMENT_MANAGER') {
        if (!user.departmentId) {
            console.warn('[roleFilter] DEPARTMENT_MANAGER has no departmentId assigned, returning empty result')
            return { _id: null }
        }
        const deptWards = getDepartmentWards(user.departmentId)
        return { ward: { $in: deptWards } }
    }

    // ─── MUNICIPAL COMMISSIONER ────────────────────────
    // Commissioner sees ALL issues - no filter
    if (role === 'MUNICIPAL_COMMISSIONER') {
        return {}  // Empty filter = all issues
    }

    // ─── SYSTEM ADMIN ──────────────────────────────────
    // Admin SHOULD see all issues for dashboard purposes
    if (role === 'SYSTEM_ADMIN') {
        return {}  // Admin sees all issues
    }

    // Unknown role — block access
    console.warn('[roleFilter] Unknown role:', user.role, '- blocking access')
    return null
}
