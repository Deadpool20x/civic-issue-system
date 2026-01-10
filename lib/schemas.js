import { z } from 'zod';

export const createIssueSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  category: z.enum(['water', 'electricity', 'roads', 'garbage', 'parks', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
  location: z.object({
    address: z.string().optional(),
    coordinates: z.tuple([z.number(), z.number()]).optional().default([0, 0])
  }).optional().default({ address: '', coordinates: [0, 0] }),
  images: z.array(z.string().url()).optional().default([])
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
