/**
 * Basic test for App component
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

describe('App', () => {
    it('renders correctly', () => {
        const { getByType } = render(<App />);
        expect(getByType('NavigationContainer')).toBeTruthy();
    });
});