import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateProfileInput } from 'shared/schemas';
import type { UserProfile, ApiResponse } from 'shared/types';
import { api } from '@services/api';
import { useAuthStore } from '@stores/authStore';

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const tokens = useAuthStore((s) => s.tokens);
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      const { data } = await api.patch<ApiResponse<{ profile: UserProfile }>>('/profile', input);
      return data.data!.profile;
    },
    onSuccess: (profile) => {
      if (user && tokens) {
        setAuth(user, profile, tokens);
      }
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
