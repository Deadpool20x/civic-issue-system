import { normalizeRole } from '../../lib/auth';

describe('normalizeRole', () => {
    it('should normalize CITIZEN role', () => {
        expect(normalizeRole('CITIZEN')).toBe('CITIZEN');
        expect(normalizeRole('citizen')).toBe('CITIZEN');
    });

    it('should normalize ADMIN roles to SYSTEM_ADMIN', () => {
        expect(normalizeRole('ADMIN')).toBe('SYSTEM_ADMIN');
        expect(normalizeRole('SYSTEM_ADMIN')).toBe('SYSTEM_ADMIN');
    });

    it('should normalize COMMISSIONER roles to MUNICIPAL_COMMISSIONER', () => {
        expect(normalizeRole('COMMISSIONER')).toBe('MUNICIPAL_COMMISSIONER');
        expect(normalizeRole('MUNICIPAL_COMMISSIONER')).toBe('MUNICIPAL_COMMISSIONER');
        expect(normalizeRole('MUNICIPAL')).toBe('MUNICIPAL_COMMISSIONER');
    });

    it('should normalize DEPARTMENT roles to DEPARTMENT_MANAGER', () => {
        expect(normalizeRole('DEPARTMENT')).toBe('DEPARTMENT_MANAGER');
        expect(normalizeRole('DEPARTMENT_MANAGER')).toBe('DEPARTMENT_MANAGER');
    });

    it('should return null for undefined or unknown roles', () => {
        expect(normalizeRole(undefined)).toBeNull();
        expect(normalizeRole(null)).toBeNull();
        expect(normalizeRole('')).toBeNull();
        expect(normalizeRole('NON_EXISTENT')).toBeNull();
    });
});
