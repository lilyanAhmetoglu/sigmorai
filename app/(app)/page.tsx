// Placeholder home inside the app shell. The landing page ticket moves `/`
// into its own (marketing) group with the design's hero nav.
export default function Home() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-6 p-4">
      <h1 className="font-display text-h1 text-xp leading-tight">Sigmorai</h1>
      <p className="max-w-reading text-body leading-body text-text-2">
        A pixel-art RPG for learning AI engineering and agentic systems.
      </p>
    </div>
  );
}
