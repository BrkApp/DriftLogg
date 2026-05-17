"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronRight, Loader2 } from "lucide-react";
import { parseRepoInput } from "@/lib/parse-repo";

type Size = "sm" | "lg";

interface ScanInputProps {
  size?: Size;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

const SIZES: Record<
  Size,
  {
    container: string;
    chevron: string;
    input: string;
    button: string;
    buttonHeight: string;
  }
> = {
  sm: {
    container: "p-1.5 rounded-lg",
    chevron: "h-3.5 w-3.5",
    input: "py-1.5 text-sm",
    button: "h-8 px-3 text-xs",
    buttonHeight: "h-8",
  },
  lg: {
    container: "p-2 rounded-xl",
    chevron: "h-4 w-4",
    input: "py-3 text-base",
    button: "h-12 px-6 text-sm",
    buttonHeight: "h-12",
  },
};

export function ScanInput({
  size = "lg",
  placeholder = "owner/repo",
  autoFocus = false,
  className = "",
}: ScanInputProps) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const trimmed = value.trim();
  const parsed = trimmed ? parseRepoInput(trimmed) : null;
  const canSubmit = parsed !== null && !pending;

  const styles = SIZES[size];

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!parsed) {
      setError("Expected format: owner/repo or github.com/owner/repo");
      return;
    }
    startTransition(() => {
      router.push(`/scan/${parsed.owner}/${parsed.repo}`);
    });
  }

  return (
    <form onSubmit={onSubmit} className={className}>
      <div
        className={`flex flex-col gap-2 border border-dl-border bg-dl-surface transition-colors focus-within:border-dl-green/60 sm:flex-row sm:items-center ${styles.container}`}
      >
        <div className="flex flex-1 items-center gap-2 px-3 sm:px-4">
          <ChevronRight className={`shrink-0 text-dl-green ${styles.chevron}`} aria-hidden />
          <input
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            placeholder={placeholder}
            spellCheck={false}
            autoComplete="off"
            autoFocus={autoFocus}
            className={`w-full bg-transparent font-mono text-dl-fg placeholder:text-dl-fg-muted/60 focus:outline-none ${styles.input}`}
          />
        </div>
        <button
          type="submit"
          disabled={!canSubmit}
          className={`group inline-flex w-full shrink-0 items-center justify-center rounded-lg bg-dl-green font-bold text-black transition-all hover:bg-dl-green/90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto ${styles.button}`}
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {size === "sm" ? "Scan" : "Scan for free"}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>
      {error && (
        <p className="mt-3 font-mono text-xs text-dl-red">{error}</p>
      )}
    </form>
  );
}
