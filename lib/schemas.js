import { z } from 'zod';

// Category structure matching PRD
export const CATEGORIES = {
  'roads-infrastructure': {
    label: '🚧 Roads & Infrastructure',
    subcategories: [
      'Pothole',
      'Broken Pavement',
      'Damaged Manhole Cover',
      'Road Surface Damage'
    ]
  },
  'street-lighting': {
    label: '💡 Street Lighting',
    subcategories: [
      'Light Not Working',
      'Flickering Light',
      'Broken Light Pole'
    ]
  },
  'waste-management': {
    label: '🗑️ Waste Management',
    subcategories: [
      'Overflowing Bin',
      'Missed Collection',
      'Illegal Dumping',
      'Broken Container'
    ]
  },
  'water-drainage': {
    label: '🚰 Water & Drainage',
    subcategories: [
      'Water Leakage',
      'Blocked Drain',
      'Street Flooding',
      'Sewage Overflow'
    ]
  },
  'parks-public-spaces': {
    label: '🌳 Parks & Public Spaces',
    subcategories: [
      'Damaged Furniture',
      'Overgrown Vegetation',
      'Graffiti',
      'Broken Equipment'
    ]
  },
  'traffic-signage': {
    label: '🚦 Traffic & Signage',
    subcategories: [
      'Damaged Sign',
      'Faded Markings',
      'Malfunctioning Signal',
      'Missing Sign'
    ]
  },
  'public-health-safety': {
    label: '🐕 Public Health & Safety',
    subcategories: [
      'Stray Animals',
      'Dead Animal',
      'Pest Infestation',
      'Unsafe Structure'
    ]
  },
  'other': {
    label: '📋 Other',
    subcategories: ['Other (please describe)']
  }
};

export const createIssueSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(30, 'Description must be at least 30 characters').max(2000, 'Description must be less than 2000 characters'),
  category: z.enum([
    'roads-infrastructure',
    'street-lighting',
    'waste-management',
    'water-drainage',
    'parks-public-spaces',
    'traffic-signage',
    'public-health-safety',
    'other'
  ]),
  subcategory: z.string().min(1, 'Please select a subcategory'),
  location: z.object({
    address: z.string().min(10, 'Address must be at least 10 characters').max(500, 'Address must be less than 500 characters'),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180)
    }).optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
  }),
  // Images are now optional (can be empty array)
  images: z.array(z.string().url('Image URL must be a valid URL'))
    .max(3, 'Maximum 3 images allowed')
    .optional()
    .default([]),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional()
});

export const userRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().regex(/^\+?[\d\s-]{10,}$/, 'Invalid phone number').optional().or(z.literal('')),
  department: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional()
  }).optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const userAdminCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().regex(/^\+?[\d\s-]{10,}$/, 'Invalid phone number').optional().or(z.literal('')),
  role: z.enum(['department', 'municipal']),
  department: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional()
  }).optional()
});
