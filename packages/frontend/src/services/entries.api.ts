import type {
  Entry,
  PaginatedResponse,
  ApiResponse,
} from 'shared/types';
import type { CreateEntryInput, UpdateEntryInput, EntryListParams } from 'shared/schemas';
import { api } from './api';

export const entriesApi = {
  create(input: CreateEntryInput) {
    return api.post<ApiResponse<Entry>>('/entries', input);
  },

  list(params?: Partial<EntryListParams>) {
    return api.get<ApiResponse<PaginatedResponse<Entry>>>('/entries', {
      params,
    });
  },

  getById(id: string) {
    return api.get<ApiResponse<Entry>>(`/entries/${id}`);
  },

  update(id: string, input: UpdateEntryInput) {
    return api.patch<ApiResponse<Entry>>(`/entries/${id}`, input);
  },

  delete(id: string) {
    return api.delete(`/entries/${id}`);
  },
};
