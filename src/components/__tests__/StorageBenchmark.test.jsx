import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StorageBenchmark from '../StorageBenchmark';

describe('StorageBenchmark Component', () => {
    test('renders initial state correctly', () => {
        render(<StorageBenchmark />);
        expect(screen.getByText(/EXECUTE BENCHMARK/i)).toBeInTheDocument();
    });

    test('updates UI when benchmark starts', async () => {
        render(<StorageBenchmark />);
        const startBtn = screen.getByText(/EXECUTE BENCHMARK/i);

        fireEvent.click(startBtn);

        // Should show progress text
        await waitFor(() => {
            expect(screen.getByText(/Stress Testing/i)).toBeInTheDocument();
        });
    });
});
