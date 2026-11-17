import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import IpvaPage from '../page';
import { api } from '@/lib/api-client';

// Mock the API client
jest.mock('@/lib/api-client', () => ({
  api: {
    get: jest.fn(),
  },
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  FileText: () => <div data-testid="icon-FileText" />,
  Plus: () => <div data-testid="icon-Plus" />,
  Search: () => <div data-testid="icon-Search" />,
  Calendar: () => <div data-testid="icon-Calendar" />,
  Car: () => <div data-testid="icon-Car" />,
  DownloadCloud: () => <div data-testid="icon-DownloadCloud" />,
  AlertTriangle: () => <div data-testid="icon-AlertTriangle" />,
  CheckCircle: () => <div data-testid="icon-CheckCircle" />,
  Clock: () => <div data-testid="icon-Clock" />,
}));

describe('IpvaPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing when API returns undefined or empty arrays (Regression for .filter bug)', async () => {
    // Simulate the API returning empty arrays or undefined
    (api.get as jest.Mock).mockImplementation((url: string) => {
      // Formatos reais da API: /ipva devolve a lista direto; /vehicles é paginado { data, total }.
      if (url === '/ipva') return Promise.resolve([]);
      if (url === '/vehicles') return Promise.resolve({ data: [{ _id: '123', licensePlate: 'ABC1234' }], total: 1 });
      return Promise.resolve({ data: [] });
    });

    render(<IpvaPage />);

    // The page should eventually show "Gestão de IPVA"
    expect(screen.getByText('Gestão de IPVA')).toBeInTheDocument();

    // Wait for loading to finish and ensure no crash happened
    await waitFor(() => {
      expect(screen.getByText('ABC1234')).toBeInTheDocument();
    });
  });
});
