import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import useStore from '../store/useStore';

// Initial Mock State
const initialState = useStore.getState();

beforeEach(() => {
    useStore.setState(initialState, true); // Reset store
});

describe('App Integration', () => {
    test('renders Dashboard by default', () => {
        render(<App />);
        expect(screen.getByText('DIAGNOSTIC MODULES')).toBeInTheDocument();
        expect(screen.getByText('KEYBOARD TESTER')).toBeInTheDocument();
    });

    test('navigates to Specs module', () => {
        render(<App />);
        const specsCard = screen.getByText('SYSTEM SPECS');
        fireEvent.click(specsCard);

        expect(screen.getByText('SYSTEM SPECIFICATIONS')).toBeInTheDocument();
        // Check if back button exists
        expect(screen.getByText('BACK')).toBeInTheDocument();
    });

    test('navigates back to Dashboard', () => {
        render(<App />);
        // Navigate to Specs
        fireEvent.click(screen.getByText('SYSTEM SPECS'));
        // Navigate Back
        fireEvent.click(screen.getByText('BACK'));

        expect(screen.getByText('DIAGNOSTIC MODULES')).toBeInTheDocument();
    });
});
