import Link from "next/link";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Activity className="h-5 w-5 text-primary" />
          DriftLogg
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="#how-it-works">How it works</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/scan">Scan a repo</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
