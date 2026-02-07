import type {
  ApiResponse,
  AISummaryResult,
  AITokenUsage,
  Entry,
} from 'shared/types';
import { api } from './api';

interface SummaryGenerateResponse {
  summary: AISummaryResult;
  token_usage: AITokenUsage;
}

export const summaryApi = {
  generate(entryId: string) {
    return api.post<ApiResponse<SummaryGenerateResponse>>(
      '/summary/generate',
      { entry_id: entryId }
    );
  },

  finalize(entryId: string, score?: number, scoreJustification?: string) {
    return api.post<ApiResponse<Entry>>('/summary/finalize', {
      entry_id: entryId,
      score,
      score_justification: scoreJustification,
    });
  },
};
