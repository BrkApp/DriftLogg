export function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:flex-row">
        <p className="text-sm text-muted-foreground">
          DriftLogg — predicting open source decline since 2026.
        </p>
        <p className="text-xs text-muted-foreground">
          Built with Next.js, Tailwind & shadcn/ui.
        </p>
      </div>
    </footer>
  );
}
