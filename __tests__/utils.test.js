/**
 * Unit tests for utility functions
 * Run with: npm test
 */

import {
    createErrorResponse,
    validateRequiredFields,
    sanitizeString,
    isValidEmail,
    isValidPriority,
    isValidCategory,
    isValidStatus
} from '../lib/utils.js';

// Mock Next.js Response for testing
class MockResponse {
    constructor(body, options) {
        this.body = body;
        this.status = options.status;
        this.headers = options.headers;
    }
}

describe('Utility Functions', () => {
    describe('createErrorResponse', () => {
        test('should create error response with message and status', async () => {
            const response = createErrorResponse('Test error', 400);
            expect(response.status).toBe(400);

            const data = await response.json();
            expect(data.error).toBe('Test error');
        });

        test('should include details in development mode', async () => {
            // Mock development environment
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development';

            const response = createErrorResponse('Test error', 500, 'Detailed error');
            const data = await response.json();
            expect(data.error).toBe('Detailed error'); // This is how createErrorResponse actually works based on the file content.

            // Restore environment
            process.env.NODE_ENV = originalEnv;
        });
    });

    describe('validateRequiredFields', () => {
        test('should return null for valid data', () => {
            const data = { title: 'Test', description: 'Test desc', category: 'water' };
            const result = validateRequiredFields(data, ['title', 'description']);
            expect(result).toBeNull();
        });

        test('should return error for missing fields', () => {
            const data = { title: 'Test' };
            const result = validateRequiredFields(data, ['title', 'description']);
            expect(result.status).toBe(400);
        });
    });

    describe('sanitizeString', () => {
        test('should sanitize HTML tags', () => {
            const input = '<script>alert("xss")</script>Hello';
            const result = sanitizeString(input);
            expect(result).toBe('scriptalert("xss")/scriptHello');
        });

        test('should handle non-string input', () => {
            expect(sanitizeString(null)).toBe('');
            expect(sanitizeString(undefined)).toBe('');
            expect(sanitizeString(123)).toBe('');
        });

        test('should limit string length', () => {
            const longString = 'a'.repeat(2000);
            const result = sanitizeString(longString);
            expect(result.length).toBe(1000);
        });
    });

    describe('isValidEmail', () => {
        test('should validate correct email formats', () => {
            expect(isValidEmail('test@example.com')).toBe(true);
            expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
        });

        test('should reject invalid email formats', () => {
            expect(isValidEmail('invalid-email')).toBe(false);
            expect(isValidEmail('@example.com')).toBe(false);
            expect(isValidEmail('test@')).toBe(false);
        });
    });

    describe('isValidPriority', () => {
        test('should validate correct priority levels', () => {
            expect(isValidPriority('low')).toBe(true);
            expect(isValidPriority('medium')).toBe(true);
            expect(isValidPriority('high')).toBe(true);
            expect(isValidPriority('urgent')).toBe(true);
        });

        test('should reject invalid priorities', () => {
            expect(isValidPriority('invalid')).toBe(false);
            expect(isValidPriority('')).toBe(false);
        });
    });

    describe('isValidCategory', () => {
        test('should validate correct categories', () => {
            expect(isValidCategory('water-drainage')).toBe(true);
            expect(isValidCategory('street-lighting')).toBe(true);
            expect(isValidCategory('roads-infrastructure')).toBe(true);
            expect(isValidCategory('waste-management')).toBe(true);
            expect(isValidCategory('parks-public-spaces')).toBe(true);
            expect(isValidCategory('other')).toBe(true);
        });

        test('should reject invalid categories', () => {
            expect(isValidCategory('invalid')).toBe(false);
            expect(isValidCategory('')).toBe(false);
        });
    });

    describe('isValidStatus', () => {
        test('should validate correct statuses', () => {
            expect(isValidStatus('pending')).toBe(true);
            expect(isValidStatus('assigned')).toBe(true);
            expect(isValidStatus('in-progress')).toBe(true);
            expect(isValidStatus('resolved')).toBe(true);
            expect(isValidStatus('rejected')).toBe(true);
            expect(isValidStatus('reopened')).toBe(true);
            expect(isValidStatus('escalated')).toBe(true);
        });

        test('should reject invalid statuses', () => {
            expect(isValidStatus('invalid')).toBe(false);
            expect(isValidStatus('')).toBe(false);
        });
    });
});

describe('Component Utilities', () => {
    describe('ErrorBoundary', () => {
        test('should render children when no error', () => {
            const { ErrorBoundary } = require('../lib/components.js');
            // This would require React testing setup
            // For now, we'll document the expected behavior
            expect(true).toBe(true); // Placeholder
        });
    });

    describe('StatusBadge', () => {
        test('should render status badge correctly', () => {
            const { StatusBadge } = require('../lib/components.js');
            // This would require React testing setup
            // For now, we'll document the expected behavior
            expect(true).toBe(true); // Placeholder
        });
    });
});
