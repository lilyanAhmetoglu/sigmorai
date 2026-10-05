'use client';

import { catchError, type ErrorInfo } from 'next/error';
import { PixelButton } from '@/components/pixel-button';
import { HUD_TEXT } from '@/lib/constants';
import { AuthControls } from './auth-controls';

/** HudBar error state. Account controls stay, so the player can still sign out. */
function HudError(_props: object, { retry }: ErrorInfo) {
  return (
    <div className="hud-bar" role="alert">
      <span className="hud-stat" data-empty>
        {HUD_TEXT.error}
      </span>
      <PixelButton variant="ghost" size="sm" onClick={() => retry()}>
        {HUD_TEXT.retry}
      </PixelButton>
      <AuthControls />
    </div>
  );
}

/** Wrap the HUD data slot: a failed read shows HudError, not a broken page. */
export const HudErrorBoundary = catchError(HudError);
