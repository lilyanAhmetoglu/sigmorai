import { getHudState } from '@/lib/data/hud';
import { HudBar } from './hud-bar';

/** Reads the signed-in player's HUD values on the server, then renders HudBar. */
export async function HudSlot() {
  const state = await getHudState();
  return <HudBar state={state} />;
}
