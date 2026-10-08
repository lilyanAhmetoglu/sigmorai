'use client';

import { catchError, type ErrorInfo } from 'next/error';
import { PixelButton } from '@/components/pixel-button';
import { HUD_TEXT } from '@/lib/constants';
import { AuthControls } from './auth-controls';

type ErrorViewProps = { onRetry: () => void };

/**
 * HudBar error state, for the server slot (HudErrorBoundary) and the public
 * pages' client HUD (PublicHud). Account controls stay, so the player can still sign out.
 */
export function HudErrorView({ onRetry }: ErrorViewProps) {
  return (
    <div className="hud-bar" role="alert">
      <span className="hud-stat" data-empty>
        {HUD_TEXT.error}
      </span>
      <PixelButton variant="ghost" size="sm" onClick={onRetry}>
        {HUD_TEXT.retry}
      </PixelButton>
      <AuthControls />
    </div>
  );
}

function HudError(_props: object, { retry }: ErrorInfo) {
  return <HudErrorView onRetry={() => retry()} />;
}

/** Wrap the HUD data slot: a failed read shows HudErrorView, not a broken page. */
export const HudErrorBoundary = catchError(HudError);
