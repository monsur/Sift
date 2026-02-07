import { useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationApi } from '@services/conversation.api';
import { summaryApi } from '@services/summary.api';

export function useStartConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: string) => {
      const { data } = await conversationApi.start(entryId);
      return data.data!;
    },
    onSuccess: (_data, entryId) => {
      queryClient.invalidateQueries({ queryKey: ['entries', 'detail', entryId] });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ entryId, message }: { entryId: string; message: string }) => {
      const { data } = await conversationApi.sendMessage(entryId, message);
      return data.data!;
    },
    onSuccess: (_data, { entryId }) => {
      queryClient.invalidateQueries({ queryKey: ['entries', 'detail', entryId] });
    },
  });
}

export function useGenerateSummary() {
  return useMutation({
    mutationFn: async (entryId: string) => {
      const { data } = await summaryApi.generate(entryId);
      return data.data!;
    },
  });
}

export function useFinalizeSummary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      entryId,
      score,
      scoreJustification,
    }: {
      entryId: string;
      score?: number;
      scoreJustification?: string;
    }) => {
      const { data } = await summaryApi.finalize(
        entryId,
        score,
        scoreJustification
      );
      return data.data!;
    },
    onSuccess: (entry) => {
      queryClient.invalidateQueries({ queryKey: ['entries', 'list'] });
      queryClient.invalidateQueries({
        queryKey: ['entries', 'detail', entry.id],
      });
    },
  });
}
