export function getRoleFilter(user) {
    const role = user.role

    // FIELD_OFFICER — sees own ward + own dept only
    if (role === 'FIELD_OFFICER' || role === 'department') {
        if (user.wardId && user.departmentId) {
            return {
                ward: user.wardId,
                assignedDepartmentCode: user.departmentId
            }
        }
        // Old 'department' user without wardId — fallback
        if (user.department) {
            return { assignedDepartment: user.department }
        }
        return { ward: '__UNASSIGNED__' } // sees nothing
    }

    // DEPARTMENT_MANAGER — sees own dept, all wards
    if (role === 'DEPARTMENT_MANAGER' || role === 'municipal') {
        if (user.departmentId) {
            return { assignedDepartmentCode: user.departmentId }
        }
        return {} // old municipal fallback
    }

    // MUNICIPAL_COMMISSIONER — sees everything
    if (role === 'MUNICIPAL_COMMISSIONER') {
        return {}
    }

    // SYSTEM_ADMIN — blocked from all issue data
    if (role === 'SYSTEM_ADMIN' || role === 'admin') {
        return null // null = block access, return 403
    }

    // CITIZEN — sees own issues only
    if (role === 'CITIZEN' || role === 'citizen') {
        return { reportedBy: user.userId }
    }

    return null // unknown role = block
}
