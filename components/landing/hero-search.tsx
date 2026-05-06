"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { parseRepoInput } from "@/lib/parse-repo";

export function HeroSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = parseRepoInput(value);
    if (!parsed) {
      setError("Format attendu : owner/repo ou github.com/owner/repo");
      return;
    }
    startTransition(() => {
      router.push(`/scan/${parsed.owner}/${parsed.repo}`);
    });
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-zinc-950/80 p-2 transition-colors focus-within:border-[#00FF88]/60 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-3 px-3 sm:px-4">
          <span className="font-mono text-xs text-zinc-500 sm:text-sm">$</span>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="github.com/vercel/next.js"
            spellCheck={false}
            autoComplete="off"
            className="w-full bg-transparent py-3 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none sm:text-base"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="group inline-flex h-12 items-center justify-center rounded-lg bg-[#00FF88] px-6 text-sm font-semibold text-black transition-all hover:bg-[#00FF88]/90 disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Scanner gratuitement
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>
      {error && (
        <p className="mt-3 font-mono text-xs text-[#FF4444]">{error}</p>
      )}
      <p className="mt-3 font-mono text-xs text-zinc-500">
        Aucun signup. Repos publics uniquement. Résultats en quelques secondes.
      </p>
    </form>
  );
}
