/**
 * Department Mapping Utility for Civic Issue System
 *
 * Automatically assigns municipal departments based on issue category and subcategory
 */

// Department category mapping configuration
const DEPARTMENT_MAPPING = {
    // Roads and Infrastructure
    'roads-infrastructure': {
        department: 'roads-infrastructure',
        subcategories: {
            'potholes': 'roads-infrastructure',
            'road-damage': 'roads-infrastructure',
            'sidewalk-issues': 'roads-infrastructure',
            'traffic-signals': 'roads-infrastructure'
        }
    },

    // Street Lighting
    'street-lighting': {
        department: 'street-lighting',
        subcategories: {
            'street-light-out': 'street-lighting',
            'flickering-light': 'street-lighting',
            'broken-light': 'street-lighting'
        }
    },

    // Waste Management
    'waste-management': {
        department: 'waste-management',
        subcategories: {
            'garbage-not-collected': 'waste-management',
            'overflowing-bin': 'waste-management',
            'illegal-dumping': 'waste-management'
        }
    },

    // Water & Drainage
    'water-drainage': {
        department: 'water-drainage',
        subcategories: {
            'water-leak': 'water-drainage',
            'drainage-blocked': 'water-drainage',
            'flooding': 'water-drainage'
        }
    },

    // Parks & Public Spaces
    'parks-public-spaces': {
        department: 'parks-public-spaces',
        subcategories: {
            'park-maintenance': 'parks-public-spaces',
            'playground-issues': 'parks-public-spaces',
            'public-space-damage': 'parks-public-spaces'
        }
    },

    // Traffic & Signage
    'traffic-signage': {
        department: 'traffic-signage',
        subcategories: {
            'missing-sign': 'traffic-signage',
            'damaged-sign': 'traffic-signage',
            'traffic-congestion': 'traffic-signage'
        }
    },

    // Public Health & Safety
    'public-health-safety': {
        department: 'public-health-safety',
        subcategories: {
            'health-hazard': 'public-health-safety',
            'safety-issue': 'public-health-safety',
            'emergency': 'public-health-safety'
        }
    }
};

/**
 * Get department assignment based on category and subcategory
 * @param {string} category - Issue category
 * @param {string} subcategory - Issue subcategory (optional)
 * @returns {string} Department name
 */
export function getDepartmentForCategory(category, subcategory = '') {
    // Check if category exists in mapping
    if (DEPARTMENT_MAPPING[category]) {
        const categoryMapping = DEPARTMENT_MAPPING[category];

        // Check if subcategory has specific department override
        if (subcategory && categoryMapping.subcategories[subcategory]) {
            return categoryMapping.subcategories[subcategory];
        }

        // Return the main department for this category
        return categoryMapping.department;
    }

    // Fallback to general administration for unknown categories
    return 'general-administration';
}

/**
 * Get all department categories mapping
 * @returns {Object} Complete department mapping
 */
export function getDepartmentMapping() {
    return DEPARTMENT_MAPPING;
}

/**
 * Get list of all departments
 * @returns {Array} List of unique department names
 */
export function getAllDepartments() {
    const departments = new Set();

    // Add all departments from mapping
    Object.values(DEPARTMENT_MAPPING).forEach(mapping => {
        departments.add(mapping.department);
        Object.values(mapping.subcategories).forEach(subDept => {
            departments.add(subDept);
        });
    });

    // Add general administration
    departments.add('general-administration');

    return Array.from(departments);
}

/**
 * Get department name from ID (for display purposes)
 * @param {string} departmentId - Department ID
 * @returns {string} Human-readable department name
 */
export function getDepartmentDisplayName(departmentId) {
    const departmentNames = {
        'roads-infrastructure': 'Roads & Infrastructure Department',
        'street-lighting': 'Street Lighting Department',
        'waste-management': 'Sanitation & Waste Management Department',
        'water-drainage': 'Water & Drainage Department',
        'parks-public-spaces': 'Parks & Public Spaces Department',
        'traffic-signage': 'Traffic & Signage Department',
        'public-health-safety': 'Public Health & Safety Department',
        'general-administration': 'General Administration'
    };

    return departmentNames[departmentId] || departmentId;
}
