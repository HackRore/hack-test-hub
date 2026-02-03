import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StorageBenchmark from '../components/StorageBenchmark';

describe('StorageBenchmark Component', () => {
    test('renders initial state correctly', () => {
        render(<StorageBenchmark />);
        expect(screen.getByText('BROWSER STORAGE BENCHMARK')).toBeInTheDocument();
        expect(screen.getByText('START BENCHMARK')).toBeInTheDocument();
    });

    test('updates UI when benchmark starts', async () => {
        render(<StorageBenchmark />);
        const startBtn = screen.getByText('START BENCHMARK');

        fireEvent.click(startBtn);

        // Should show progress text
        await waitFor(() => {
            expect(screen.getByText(/RUNNING DIAGNOSTICS/i)).toBeInTheDocument();
        });
    });
});
