import { AuthControls } from '@/components/hud/auth-controls';

// Placeholder until the landing page (build step 1). Shows tokens, fonts and sign-in.
export default function Home() {
  return (
    <>
      <header className="flex justify-end p-4">
        <AuthControls />
      </header>
      <main className="max-w-app mx-auto flex w-full flex-1 flex-col justify-center gap-6 p-4">
        <h1 className="font-display text-h1 text-xp leading-tight">Sigmorai</h1>
        <p className="max-w-reading text-body leading-body text-text-2">
          A pixel-art RPG for learning AI engineering and agentic systems.
        </p>
      </main>
    </>
  );
}
