// Security utilities for data anonymization and privacy protection

export function anonymizeUserData(user, requesterRole, requesterId) {
    if (!user) return null;
    
    // Admin and municipal users can see full details
    if (requesterRole === 'admin' || requesterRole === 'municipal') {
        return user;
    }
    
    // Users can see their own full details
    if (user._id && user._id.toString() === requesterId) {
        return user;
    }
    
    // For all other cases, anonymize the data
    return {
        _id: user._id,
        name: 'Anonymous User',
        email: '***@***.***',
        phone: '***-***-****'
    };
}

export function anonymizeLocationData(location, requesterRole) {
    if (!location) return null;
    
    // Admin and municipal users can see full location
    if (requesterRole === 'admin' || requesterRole === 'municipal') {
        return location;
    }
    
    // For other users, show only general area
    return {
        address: location.address ? 
            location.address.split(' ').slice(0, 2).join(' ') + '...' : 
            'Location Hidden',
        coordinates: [0, 0] // Hide exact coordinates
    };
}

export function filterSensitiveData(issue, requesterRole, requesterId) {
    const filteredIssue = { ...issue };
    
    // Anonymize reporter data
    if (filteredIssue.reportedBy) {
        filteredIssue.reportedBy = anonymizeUserData(filteredIssue.reportedBy, requesterRole, requesterId);
    }
    
    // Anonymize location data
    if (filteredIssue.location) {
        filteredIssue.location = anonymizeLocationData(filteredIssue.location, requesterRole);
    }
    
    // Hide staff assignments for citizens
    if (requesterRole === 'citizen') {
        filteredIssue.assignedTo = null;
        if (filteredIssue.assignedStaff) filteredIssue.assignedStaff = null;
        if (filteredIssue.departmentHead) filteredIssue.departmentHead = null;
    }
    
    // Hide internal comments for non-admin users
    if (requesterRole !== 'admin' && requesterRole !== 'municipal') {
        filteredIssue.comments = filteredIssue.comments?.filter(comment => 
            comment.user.toString() === requesterId
        ) || [];
    }
    
    // Hide escalation history for non-admin users
    if (requesterRole !== 'admin' && requesterRole !== 'municipal') {
        if (filteredIssue.sla) {
            filteredIssue.sla = {
                ...filteredIssue.sla,
                escalationHistory: []
            };
        }
    }
    
    // Hide internal reminders and penalty points
    if (requesterRole !== 'admin' && requesterRole !== 'municipal') {
        if (filteredIssue.reminders) filteredIssue.reminders = [];
        if (filteredIssue.penaltyPoints !== undefined) filteredIssue.penaltyPoints = undefined;
        if (filteredIssue.resolutionTime !== undefined) filteredIssue.resolutionTime = undefined;
    }
    
    return filteredIssue;
}

export function validateDataAccess(resource, requesterRole, requesterId) {
    // Define access rules
    const accessRules = {
        'issue:read:own': ['citizen', 'admin', 'municipal', 'department'],
        'issue:read:all': ['admin', 'municipal'],
        'issue:read:department': ['admin', 'municipal', 'department'],
        'user:read:own': ['citizen', 'admin', 'municipal', 'department'],
        'user:read:all': ['admin', 'municipal'],
        'location:read:exact': ['admin', 'municipal'],
        'location:read:general': ['citizen', 'admin', 'municipal', 'department'],
        'comments:read:own': ['citizen', 'admin', 'municipal', 'department'],
        'comments:read:all': ['admin', 'municipal'],
        'escalation:read': ['admin', 'municipal']
    };
    
    return accessRules[resource]?.includes(requesterRole) || false;
}

export function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    // Remove potentially dangerous characters
    return input
        .replace(/[<>]/g, '') // Remove HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim();
}

export function generateSecureToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function maskEmail(email) {
    if (!email || !email.includes('@')) return '***@***.***';
    
    const [local, domain] = email.split('@');
    const maskedLocal = local.length > 2 ? 
        local.substring(0, 2) + '*'.repeat(local.length - 2) : 
        '*'.repeat(local.length);
    
    return `${maskedLocal}@${domain}`;
}

export function maskPhone(phone) {
    if (!phone) return '***-***-****';
    
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 4) return '***-***-****';
    
    return '***-***-' + digits.slice(-4);
}

export function maskAddress(address) {
    if (!address) return 'Location Hidden';
    
    const parts = address.split(' ');
    if (parts.length <= 2) return 'Location Hidden';
    
    return parts.slice(0, 2).join(' ') + '...';
}
