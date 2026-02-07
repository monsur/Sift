import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserProfile, AuthTokens } from 'shared/types';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setAuth: (user: User, profile: UserProfile, tokens: AuthTokens) => void;
  setTokens: (tokens: AuthTokens) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  profile: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      setAuth: (user, profile, tokens) =>
        set({
          user,
          profile,
          tokens,
          isAuthenticated: true,
          isLoading: false,
        }),

      setTokens: (tokens) => set({ tokens }),

      setLoading: (isLoading) => set({ isLoading }),

      clearAuth: () => set(initialState),
    }),
    {
      name: 'sift-auth',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
