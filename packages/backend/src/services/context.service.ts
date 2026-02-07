import type { Entry } from 'shared/types';
import { CONTEXT_DAYS } from 'shared/constants';
import { getServiceClient } from '../config/supabase.js';

export async function getRecentEntries(userId: string): Promise<Entry[]> {
  const supabase = getServiceClient();

  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - CONTEXT_DAYS);
  const sinceDateStr = sinceDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', userId)
    .gte('entry_date', sinceDateStr)
    .order('entry_date', { ascending: false });

  if (error) {
    return [];
  }

  return (data ?? []).map(mapEntry);
}

function mapEntry(data: Record<string, unknown>): Entry {
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
    conversation_transcript:
      (data.conversation_transcript as Entry['conversation_transcript']) ??
      null,
    token_count: (data.token_count as number) ?? null,
    estimated_cost: (data.estimated_cost as number) ?? null,
    created_at: data.created_at as string,
    updated_at: data.updated_at as string,
  };
}
