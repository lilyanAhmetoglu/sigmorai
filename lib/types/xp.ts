import { z } from 'zod';
import { XP_REASONS } from '@/lib/constants';

export const XpReasonSchema = z.enum(XP_REASONS);
export type XpReason = z.infer<typeof XpReasonSchema>;
