import type { ApiResponse, AIConversationTurnResult } from 'shared/types';
import { api } from './api';

export const conversationApi = {
  start(entryId: string) {
    return api.post<ApiResponse<AIConversationTurnResult>>(
      '/conversation/start',
      { entry_id: entryId }
    );
  },

  sendMessage(entryId: string, message: string) {
    return api.post<ApiResponse<AIConversationTurnResult>>(
      '/conversation/message',
      { entry_id: entryId, message }
    );
  },
};
