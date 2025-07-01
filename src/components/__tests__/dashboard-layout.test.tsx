/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { ClerkProvider } from '@clerk/nextjs';
import DashboardLayout from '@/components/dashboard-layout';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
}));

// Mock Clerk useUser to always return an authenticated user
jest.mock('@clerk/nextjs', () => ({
  ...jest.requireActual('@clerk/nextjs'),
  useUser: () => ({ user: { id: 'user_123', firstName: 'Test', lastName: 'User' }, isLoaded: true }),
}));

describe('DashboardLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders navigation items', () => {
    render(
      <ClerkProvider>
        <DashboardLayout>
          <div>Test content</div>
        </DashboardLayout>
      </ClerkProvider>
    );

    // Check that navigation items are present - using getAllByRole to handle duplicates
    const dashboardLinks = screen.getAllByRole('link', { name: /dashboard/i });
    const leadsLinks = screen.getAllByRole('link', { name: /leads/i });
    const dealsLinks = screen.getAllByRole('link', { name: /deals/i });
    const kanbanLinks = screen.getAllByRole('link', { name: /kanban/i });
    const settingsLinks = screen.getAllByRole('link', { name: /settings/i });

    expect(dashboardLinks.length).toBeGreaterThan(0);
    expect(leadsLinks.length).toBeGreaterThan(0);
    expect(dealsLinks.length).toBeGreaterThan(0);
    expect(kanbanLinks.length).toBeGreaterThan(0);
    expect(settingsLinks.length).toBeGreaterThan(0);
  });

  it('renders CRM title', () => {
    render(
      <ClerkProvider>
        <DashboardLayout>
          <div>Test content</div>
        </DashboardLayout>
      </ClerkProvider>
    );

    expect(screen.getByRole('heading', { name: 'CRM' })).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <ClerkProvider>
        <DashboardLayout>
          <div>Test content</div>
        </DashboardLayout>
      </ClerkProvider>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('highlights active navigation item', () => {
    render(
      <ClerkProvider>
        <DashboardLayout>
          <div>Test content</div>
        </DashboardLayout>
      </ClerkProvider>
    );

    // Get all dashboard links and check that at least one has the active class
    const dashboardLinks = screen.getAllByRole('link', { name: /dashboard/i });
    const hasActiveLink = dashboardLinks.some(link => 
      link.classList.contains('border-blue-500')
    );
    expect(hasActiveLink).toBe(true);
  });
});
