import type { Entry, ConversationMessage, PaginatedResponse } from 'shared/types';
import type { CreateEntryInput, UpdateEntryInput, EntryListParams } from 'shared/schemas';
import { getServiceClient } from '../config/supabase.js';
import { AppError, NotFoundError, ForbiddenError } from '../utils/errors.js';
import { dashboardService } from './dashboard.service.js';

export class EntryService {
  async create(userId: string, input: CreateEntryInput): Promise<Entry> {
    const supabase = getServiceClient();

    // Check for duplicate date
    const { data: existing } = await supabase
      .from('entries')
      .select('id')
      .eq('user_id', userId)
      .eq('entry_date', input.entry_date)
      .single();

    if (existing) {
      throw new AppError(
        'An entry already exists for this date',
        409,
        'DUPLICATE_ENTRY_DATE'
      );
    }

    const { data, error } = await supabase
      .from('entries')
      .insert({
        user_id: userId,
        entry_date: input.entry_date,
        raw_entry: input.raw_entry,
        score: input.score ?? null,
        input_method: input.input_method ?? 'text',
        voice_duration_seconds: input.voice_duration_seconds ?? null,
      })
      .select()
      .single();

    if (error || !data) {
      throw new AppError('Failed to create entry', 500, 'ENTRY_CREATE_FAILED');
    }

    dashboardService.updateCachedStats(userId).catch(console.error);
    return this.mapEntry(data);
  }

  async getById(userId: string, entryId: string): Promise<Entry> {
    const supabase = getServiceClient();

    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('id', entryId)
      .single();

    if (error || !data) {
      throw new NotFoundError('Entry not found');
    }

    if (data.user_id !== userId) {
      throw new ForbiddenError('You do not have access to this entry');
    }

    return this.mapEntry(data);
  }

  async list(
    userId: string,
    params: EntryListParams
  ): Promise<PaginatedResponse<Entry>> {
    const supabase = getServiceClient();
    const { page, limit, sort_by, sort_order, date_from, date_to, search } = params;
    const offset = (page - 1) * limit;

    // Count query
    let countQuery = supabase
      .from('entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (date_from) countQuery = countQuery.gte('entry_date', date_from);
    if (date_to) countQuery = countQuery.lte('entry_date', date_to);
    if (search) countQuery = countQuery.or(`raw_entry.ilike.%${search}%,tldr.ilike.%${search}%`);

    const { count, error: countError } = await countQuery;

    if (countError) {
      throw new AppError('Failed to fetch entries', 500, 'ENTRY_LIST_FAILED');
    }

    const total = count ?? 0;

    // Data query
    let dataQuery = supabase
      .from('entries')
      .select('*')
      .eq('user_id', userId);

    if (date_from) dataQuery = dataQuery.gte('entry_date', date_from);
    if (date_to) dataQuery = dataQuery.lte('entry_date', date_to);
    if (search) dataQuery = dataQuery.or(`raw_entry.ilike.%${search}%,tldr.ilike.%${search}%`);

    const { data, error } = await dataQuery
      .order(sort_by, { ascending: sort_order === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new AppError('Failed to fetch entries', 500, 'ENTRY_LIST_FAILED');
    }

    return {
      items: (data ?? []).map((row) => this.mapEntry(row)),
      total,
      page,
      limit,
      hasMore: offset + limit < total,
    };
  }

  async update(
    userId: string,
    entryId: string,
    input: UpdateEntryInput
  ): Promise<Entry> {
    // Ownership check
    await this.getById(userId, entryId);

    const supabase = getServiceClient();

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (input.score !== undefined) {
      updates.score = input.score;
    }
    if (input.score_justification !== undefined) {
      updates.score_justification = input.score_justification;
    }

    const { data, error } = await supabase
      .from('entries')
      .update(updates)
      .eq('id', entryId)
      .select()
      .single();

    if (error || !data) {
      throw new AppError('Failed to update entry', 500, 'ENTRY_UPDATE_FAILED');
    }

    return this.mapEntry(data);
  }

  async saveTranscript(
    userId: string,
    entryId: string,
    transcript: ConversationMessage[]
  ): Promise<Entry> {
    await this.getById(userId, entryId);
    const supabase = getServiceClient();

    const { data, error } = await supabase
      .from('entries')
      .update({
        conversation_transcript: transcript,
        updated_at: new Date().toISOString(),
      })
      .eq('id', entryId)
      .select()
      .single();

    if (error || !data) {
      throw new AppError('Failed to save transcript', 500, 'ENTRY_UPDATE_FAILED');
    }

    return this.mapEntry(data);
  }

  async saveRefinement(
    userId: string,
    entryId: string,
    refinement: {
      refined_entry: string;
      tldr: string;
      key_moments: string[];
      ai_suggested_score: number;
      score_justification: string;
      score?: number;
      token_count: number;
      estimated_cost: number;
    }
  ): Promise<Entry> {
    await this.getById(userId, entryId);
    const supabase = getServiceClient();

    const { data, error } = await supabase
      .from('entries')
      .update({
        refined_entry: refinement.refined_entry,
        tldr: refinement.tldr,
        key_moments: refinement.key_moments,
        ai_suggested_score: refinement.ai_suggested_score,
        score_justification: refinement.score_justification,
        score: refinement.score ?? refinement.ai_suggested_score,
        token_count: refinement.token_count,
        estimated_cost: refinement.estimated_cost,
        updated_at: new Date().toISOString(),
      })
      .eq('id', entryId)
      .select()
      .single();

    if (error || !data) {
      throw new AppError(
        'Failed to save refinement',
        500,
        'ENTRY_UPDATE_FAILED'
      );
    }

    dashboardService.updateCachedStats(userId).catch(console.error);
    return this.mapEntry(data);
  }

  async delete(userId: string, entryId: string): Promise<void> {
    // Ownership check
    await this.getById(userId, entryId);

    const supabase = getServiceClient();

    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', entryId);

    if (error) {
      throw new AppError('Failed to delete entry', 500, 'ENTRY_DELETE_FAILED');
    }

    dashboardService.updateCachedStats(userId).catch(console.error);
  }

  private mapEntry(data: Record<string, unknown>): Entry {
    return {
      id: data.id as string,
      user_id: data.user_id as string,
      entry_date: data.entry_date as string,
      raw_entry: data.raw_entry as string,
      refined_entry: (data.refined_entry as string) ?? null,
      tldr: (data.tldr as string) ?? null,
      key_moments: (data.key_moments as string[]) ?? null,
      score: (data.score as number) ?? null,
      ai_suggested_score: (data.ai_suggested_score as number) ?? null,
      score_justification: (data.score_justification as string) ?? null,
      input_method: (data.input_method as 'text' | 'voice') ?? 'text',
      voice_duration_seconds: (data.voice_duration_seconds as number) ?? null,
      conversation_transcript: (data.conversation_transcript as Entry['conversation_transcript']) ?? null,
      token_count: (data.token_count as number) ?? null,
      estimated_cost: (data.estimated_cost as number) ?? null,
      created_at: data.created_at as string,
      updated_at: data.updated_at as string,
    };
  }
}

export const entryService = new EntryService();
