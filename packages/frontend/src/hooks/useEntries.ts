import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { EntryListParams, CreateEntryInput, UpdateEntryInput } from 'shared/schemas';
import { entriesApi } from '@services/entries.api';

export function useEntryList(params?: Partial<EntryListParams>) {
  return useQuery({
    queryKey: ['entries', 'list', params],
    queryFn: async () => {
      const { data } = await entriesApi.list(params);
      return data.data!;
    },
  });
}

export function useEntry(id: string | undefined) {
  return useQuery({
    queryKey: ['entries', 'detail', id],
    queryFn: async () => {
      const { data } = await entriesApi.getById(id!);
      return data.data!;
    },
    enabled: !!id,
  });
}

export function useCreateEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateEntryInput) => {
      const { data } = await entriesApi.create(input);
      return data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateEntryInput }) => {
      const { data } = await entriesApi.update(id, input);
      return data.data!;
    },
    onSuccess: (entry) => {
      queryClient.invalidateQueries({ queryKey: ['entries', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['entries', 'detail', entry.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteEntry() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (id: string) => {
      await entriesApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      navigate('/history');
    },
  });
}
