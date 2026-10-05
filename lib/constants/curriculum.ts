/**
 * The curriculum map (docs/plans/curriculum-design-plan.md). Names, NPCs and
 * tiers come from design/ui_kits/webapp/Sigmorai App.dc.html (REALMS, LV);
 * Math floors use the spec's reordered list (Statistics added, cosine in floor 1).
 * Per-track text (topic, lore, chapter titles) lives in content/<track>/outline.json.
 * Counts and track names are in ./exercises.ts.
 */
import type { Accent, Track } from '@/lib/types';
import { FRONTIER_AREA, MATH_AREA } from './exercises';

/** Track chip colour, from the design's TR table (builder = ember, strategist = spark). */
export const TRACK_ACCENTS: Record<Track, Accent> = {
  builder: 'accent',
  strategist: 'xp',
};

/** UI labels are the upper-case form (BEGINNER / INTERMEDIATE / ADVANCED). */
export const TIERS = ['beginner', 'intermediate', 'advanced'] as const;
/** Tiers a learner can enter today. Advanced is visible but locked. */
export const OPEN_TIERS = [
  'beginner',
  'intermediate',
] as const satisfies readonly (typeof TIERS)[number][];

/** Shared by both tracks. `id` is the realm number; helpers derive folder, art and accent. */
export const REALMS = [
  {
    id: 0,
    slug: 'bootstrap-village',
    name: 'Bootstrap Village',
    npc: 'Elder Maren',
    tier: 'beginner',
  },
  { id: 1, slug: 'prompt-forest', name: 'Prompt Forest', npc: 'Ranger Iso', tier: 'beginner' },
  { id: 2, slug: 'tool-forge', name: 'Tool Forge', npc: 'Smith Korren', tier: 'beginner' },
  {
    id: 3,
    slug: 'context-library',
    name: 'Context Library',
    npc: 'Archivist Vela',
    tier: 'intermediate',
  },
  { id: 4, slug: 'agent-citadel', name: 'Agent Citadel', npc: 'Warden Tess', tier: 'intermediate' },
  {
    id: 5,
    slug: 'mcp-bridgelands',
    name: 'MCP Bridgelands',
    npc: 'Bridgekeeper Nal',
    tier: 'intermediate',
  },
  { id: 6, slug: 'eval-arena', name: 'Eval Arena', npc: 'Judge Arra', tier: 'advanced' },
  { id: 7, slug: 'swarm-spire', name: 'Swarm Spire', npc: 'The Conductor', tier: 'advanced' },
  {
    id: 8,
    slug: 'production-peaks',
    name: 'Production Peaks',
    npc: 'Summit Guide Pell',
    tier: 'advanced',
  },
] as const satisfies readonly {
  id: number;
  slug: string;
  name: string;
  npc: string;
  tier: (typeof TIERS)[number];
}[];

/** Math Tower floors, opened in order. No tier: all free. */
export const MATH_FLOORS = [
  { n: 1, slug: 'vectors', name: 'Vectors & similarity' },
  { n: 2, slug: 'probability', name: 'Probability' },
  { n: 3, slug: 'statistics', name: 'Statistics' },
  { n: 4, slug: 'matrices', name: 'Matrices' },
  { n: 5, slug: 'softmax', name: 'Softmax & temperature' },
  { n: 6, slug: 'gradients', name: 'Gradients' },
  { n: 7, slug: 'cross-entropy', name: 'Cross-entropy' },
  { n: 8, slug: 'attention', name: 'Attention' },
] as const;

/** Side realm of free math floors. Floors are in MATH_FLOORS. */
export const MATH_TOWER = { slug: MATH_AREA, name: 'Math Tower', npc: 'Numerist Oru' } as const;

/** Side realm filled by the sync job. No tier (all open), no NPC, no outline. */
export const FRONTIER = { slug: FRONTIER_AREA, name: 'The Frontier' } as const;

/** Where lessons live, and the per-area outline file inside it. */
export const CONTENT_DIR = 'content';
export const OUTLINE_FILE = 'outline.json';
/** Public URL base of the level art (public/levels/realm-0N, public/levels/math). */
export const LEVEL_ART_BASE = '/levels';
