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
        expect(screen.getByText(/Device Diagnostics Dashboard/i)).toBeInTheDocument();
    });

    test.skip('navigates to Specs module', () => {
        render(<App />);
        const specsCard = screen.getByText(/System Specs/i);
        fireEvent.click(specsCard);

        expect(screen.getByText(/SYSTEM SPECIFICATIONS/i)).toBeInTheDocument();
        // Check if back button exists
        expect(screen.getByText(/BACK/i)).toBeInTheDocument();
    });

    test.skip('navigates back to Dashboard', () => {
        render(<App />);
        // Navigate to Specs
        fireEvent.click(screen.getByText(/System Specs/i));
        // Navigate Back
        fireEvent.click(screen.getByText(/BACK/i));

        expect(screen.getByText(/Device Diagnostics Dashboard/i)).toBeInTheDocument();
    });
});
