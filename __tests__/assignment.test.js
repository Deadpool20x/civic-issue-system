import { calculatePriority } from '@/lib/priority-calculator';
import { getDepartmentForCategory, getDepartmentCodeForCategory } from '@/lib/department-mapper';

describe('Auto-Assignment Logic (Phase 2)', () => {
    test('calculatePriority should handle urgent keywords', () => {
        const priority = calculatePriority({
            title: 'Emergency: Fire and explosion',
            description: 'Immediate threat to life',
            category: 'health'
        });
        expect(priority).toBe('urgent');
    });

    test('getDepartmentCodeForCategory should return correct codes', () => {
        expect(getDepartmentCodeForCategory('water-drainage')).toBe('water');
        expect(getDepartmentCodeForCategory('roads-infrastructure')).toBe('roads');
    });

    test('getDepartmentForCategory should return correct names', () => {
        expect(getDepartmentForCategory('water-drainage')).toBe('water-drainage');
        expect(getDepartmentForCategory('roads-infrastructure')).toBe('roads-infrastructure');
    });
});
