const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s-]{10,}$/;
const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

function failure(path, message) {
  return {
    success: false,
    error: {
      errors: [
        {
          path: Array.isArray(path) ? path : [path],
          message
        }
      ]
    }
  };
}

function success(data) {
  return { success: true, data };
}

function validateOptionalString(value, path) {
  if (value === undefined) {
    return null;
  }

  if (typeof value !== 'string') {
    return failure(path, `${path[path.length - 1]} must be a string`);
  }

  return null;
}

export const CATEGORIES = {
  'roads-infrastructure': {
    label: '🚧 Roads & Infrastructure',
    subcategories: ['Pothole', 'Broken Pavement', 'Damaged Manhole Cover', 'Road Surface Damage']
  },
  'street-lighting': {
    label: '💡 Street Lighting',
    subcategories: ['Light Not Working', 'Flickering Light', 'Broken Light Pole']
  },
  'waste-management': {
    label: '🗑️ Waste Management',
    subcategories: ['Overflowing Bin', 'Missed Collection', 'Illegal Dumping', 'Broken Container']
  },
  'water-drainage': {
    label: '🚰 Water & Drainage',
    subcategories: ['Water Leakage', 'Blocked Drain', 'Street Flooding', 'Sewage Overflow']
  },
  'parks-public-spaces': {
    label: '🌳 Parks & Public Spaces',
    subcategories: ['Damaged Furniture', 'Overgrown Vegetation', 'Graffiti', 'Broken Equipment']
  },
  'traffic-signage': {
    label: '🚦 Traffic & Signage',
    subcategories: ['Damaged Sign', 'Faded Markings', 'Malfunctioning Signal', 'Missing Sign']
  },
  'public-health-safety': {
    label: '🐕 Public Health & Safety',
    subcategories: ['Stray Animals', 'Dead Animal', 'Pest Infestation', 'Unsafe Structure']
  },
  other: {
    label: '📋 Other',
    subcategories: ['Other (please describe)']
  }
};

export const createIssueSchema = {
  safeParse(input) {
    if (!input || typeof input !== 'object') {
      return failure([], 'Invalid request body');
    }

    if (typeof input.title !== 'string' || input.title.trim().length < 10) {
      return failure(['title'], 'Title must be at least 10 characters');
    }

    if (input.title.length > 200) {
      return failure(['title'], 'Title must be less than 200 characters');
    }

    if (typeof input.description !== 'string' || input.description.trim().length < 30) {
      return failure(['description'], 'Description must be at least 30 characters');
    }

    if (input.description.length > 2000) {
      return failure(['description'], 'Description must be less than 2000 characters');
    }

    if (!Object.prototype.hasOwnProperty.call(CATEGORIES, input.category)) {
      return failure(['category'], 'Invalid category');
    }

    if (typeof input.subcategory !== 'string' || !input.subcategory.trim()) {
      return failure(['subcategory'], 'Please select a subcategory');
    }

    if (!input.location || typeof input.location !== 'object') {
      return failure(['location'], 'Location is required');
    }

    if (typeof input.location.address !== 'string' || input.location.address.trim().length < 10) {
      return failure(['location', 'address'], 'Address must be at least 10 characters');
    }

    if (input.location.address.length > 500) {
      return failure(['location', 'address'], 'Address must be less than 500 characters');
    }

    if (input.location.coordinates !== undefined) {
      const coordinates = input.location.coordinates;
      if (!coordinates || typeof coordinates !== 'object') {
        return failure(['location', 'coordinates'], 'Coordinates must be an object');
      }

      if (coordinates.lat !== undefined && (typeof coordinates.lat !== 'number' || coordinates.lat < -90 || coordinates.lat > 90)) {
        return failure(['location', 'coordinates', 'lat'], 'lat must be between -90 and 90');
      }

      if (coordinates.lng !== undefined && (typeof coordinates.lng !== 'number' || coordinates.lng < -180 || coordinates.lng > 180)) {
        return failure(['location', 'coordinates', 'lng'], 'lng must be between -180 and 180');
      }
    }

    if (input.images !== undefined) {
      if (!Array.isArray(input.images)) {
        return failure(['images'], 'Images must be an array');
      }

      if (input.images.length > 3) {
        return failure(['images'], 'Maximum 3 images allowed');
      }

      for (const image of input.images) {
        if (typeof image !== 'string' || !URL_REGEX.test(image)) {
          return failure(['images'], 'Image URL must be a valid URL');
        }
      }
    }

    if (input.priority !== undefined && !['low', 'medium', 'high', 'urgent'].includes(input.priority)) {
      return failure(['priority'], 'Invalid priority');
    }

    return success({
      ...input,
      images: input.images || []
    });
  }
};

export const userRegisterSchema = {
  safeParse(input) {
    if (!input || typeof input !== 'object') {
      return failure([], 'Invalid request body');
    }

    if (typeof input.name !== 'string' || input.name.trim().length < 2) {
      return failure(['name'], 'Name must be at least 2 characters');
    }

    if (typeof input.email !== 'string' || !EMAIL_REGEX.test(input.email)) {
      return failure(['email'], 'Invalid email address');
    }

    if (typeof input.password !== 'string' || input.password.length < 6) {
      return failure(['password'], 'Password must be at least 6 characters');
    }

    if (input.phone !== undefined && input.phone !== '' && (typeof input.phone !== 'string' || !PHONE_REGEX.test(input.phone))) {
      return failure(['phone'], 'Invalid phone number');
    }

    return success(input);
  }
};

export const loginSchema = {
  safeParse(input) {
    if (!input || typeof input !== 'object') {
      return failure([], 'Invalid request body');
    }

    if (typeof input.email !== 'string' || !EMAIL_REGEX.test(input.email)) {
      return failure(['email'], 'Invalid email address');
    }

    if (typeof input.password !== 'string' || input.password.length < 1) {
      return failure(['password'], 'Password is required');
    }

    return success(input);
  }
};

export const userAdminCreateSchema = {
  safeParse(input) {
    if (!input || typeof input !== 'object') {
      return failure([], 'Invalid request body');
    }

    if (typeof input.name !== 'string' || input.name.trim().length < 2) {
      return failure(['name'], 'Name must be at least 2 characters');
    }

    if (typeof input.email !== 'string' || !EMAIL_REGEX.test(input.email)) {
      return failure(['email'], 'Invalid email address');
    }

    if (typeof input.password !== 'string' || input.password.length < 6) {
      return failure(['password'], 'Password must be at least 6 characters');
    }

    if (input.phone !== undefined && input.phone !== '' && (typeof input.phone !== 'string' || !PHONE_REGEX.test(input.phone))) {
      return failure(['phone'], 'Invalid phone number');
    }

    const allowedRoles = [
      'citizen',
      'department',
      'municipal',
      'admin',
      'commissioner',
      'CITIZEN',
      'FIELD_OFFICER',
      'DEPARTMENT_MANAGER',
      'SYSTEM_ADMIN',
      'MUNICIPAL_COMMISSIONER'
    ];

    if (!allowedRoles.includes(input.role)) {
      return failure(['role'], 'Invalid role');
    }

    const addressError = validateOptionalString(input.department, ['department'])
      || validateOptionalString(input.departmentId, ['departmentId'])
      || validateOptionalString(input.wardId, ['wardId'])
      || validateOptionalString(input.ward, ['ward']);

    if (addressError) {
      return addressError;
    }

    return success(input);
  }
};
