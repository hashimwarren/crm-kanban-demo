/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import DashboardLayout from '@/components/dashboard-layout';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

describe('DashboardLayout', () => {
  it('renders navigation items', () => {
    render(
      <DashboardLayout>
        <div>Test content</div>
      </DashboardLayout>
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
      <DashboardLayout>
        <div>Test content</div>
      </DashboardLayout>
    );

    expect(screen.getByRole('heading', { name: 'CRM' })).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <DashboardLayout>
        <div>Test content</div>
      </DashboardLayout>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders demo user fallback', () => {
    render(
      <DashboardLayout>
        <div>Test content</div>
      </DashboardLayout>
    );

    expect(screen.getByText('Demo User')).toBeInTheDocument();
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('highlights active navigation item', () => {
    render(
      <DashboardLayout>
        <div>Test content</div>
      </DashboardLayout>
    );

    // Get all dashboard links and check that at least one has the active class
    const dashboardLinks = screen.getAllByRole('link', { name: /dashboard/i });
    const hasActiveLink = dashboardLinks.some(link => 
      link.classList.contains('border-blue-500')
    );
    expect(hasActiveLink).toBe(true);
  });
});
