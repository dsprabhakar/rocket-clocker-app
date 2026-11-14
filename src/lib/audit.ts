import { supabase } from './supabase'
import type { Role } from '@/types/database'

export async function logAction(
  actorId: string,
  actorRole: Role,
  action: string,
  description: string,
  metadata?: Record<string, unknown>
) {
  await supabase.from('audit_log').insert({
    actor_id: actorId,
    actor_role: actorRole,
    action,
    description,
    metadata: metadata || null,
  })
}
