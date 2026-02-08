import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import SettingsPage from './SettingsPage';

const { mockUseAuthStore } = vi.hoisted(() => ({
  mockUseAuthStore: vi.fn(),
}));

vi.mock('@stores/authStore', () => ({
  useAuthStore: (selector: (s: unknown) => unknown) => selector(mockUseAuthStore()),
}));

const { mockUpdateMutate } = vi.hoisted(() => ({
  mockUpdateMutate: vi.fn(),
}));

vi.mock('@hooks/useProfile', () => ({
  useUpdateProfile: () => ({
    mutate: mockUpdateMutate,
    isPending: false,
  }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthStore.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      profile: {
        id: 'p-1',
        user_id: 'user-1',
        settings: { theme: 'system', default_refine_enabled: true },
      },
      tokens: { access_token: 'tok' },
      setAuth: vi.fn(),
    });
  });

  it('renders settings sections', () => {
    render(<SettingsPage />, { wrapper: createWrapper() });
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Preferences')).toBeInTheDocument();
  });

  it('displays user email', () => {
    render(<SettingsPage />, { wrapper: createWrapper() });
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('renders theme buttons', () => {
    render(<SettingsPage />, { wrapper: createWrapper() });
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('changes theme when button clicked', async () => {
    render(<SettingsPage />, { wrapper: createWrapper() });
    const user = userEvent.setup();
    await user.click(screen.getByText('Dark'));

    expect(mockUpdateMutate).toHaveBeenCalledWith({
      settings: { theme: 'dark' },
    });
  });

  it('toggles refine preference', async () => {
    render(<SettingsPage />, { wrapper: createWrapper() });
    const user = userEvent.setup();
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(mockUpdateMutate).toHaveBeenCalledWith({
      settings: { default_refine_enabled: false },
    });
  });
});
