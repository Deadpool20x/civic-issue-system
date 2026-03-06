import { render, screen } from '@testing-library/react';
import StatCard from '@/components/StatCard';
import '@testing-library/jest-dom';

describe('Frontend Components (Phase 3 Dark Theme)', () => {
    test('StatCard should render with dark theme classes', () => {
        render(<StatCard label="Total Issues" value={42} icon="📊" />);

        const card = screen.getByText('Total Issues').closest('.stat-card');
        expect(card).toBeInTheDocument();
        // Check if it has the base card classes from globals.css
        expect(card).toHaveClass('stat-card');
    });

    test('StatCard should display trend indicator if provided', () => {
        render(<StatCard label="Resolved" value={10} trend={{ positive: true, value: 15 }} />);

        const trendElement = screen.getByText(/↑/);
        expect(trendElement).toHaveClass('text-green-400');
        expect(screen.getByText(/15%/)).toBeInTheDocument();
    });
});
