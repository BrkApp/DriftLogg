"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseRepoInput } from "@/lib/parse-repo";

interface ScanFormProps {
  defaultValue?: string;
}

export function ScanForm({ defaultValue = "" }: ScanFormProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = parseRepoInput(value);
    if (!parsed) {
      setError("Try `owner/repo` or a full github.com URL.");
      return;
    }
    setPending(true);
    router.push(`/scan/${parsed.owner}/${parsed.repo}`);
  }

  return (
    <form onSubmit={onSubmit} className="w-full space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          autoFocus
          name="repo"
          type="text"
          placeholder="vercel/next.js  or  https://github.com/vercel/next.js"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-12 text-base"
        />
        <Button type="submit" size="lg" disabled={pending} className="sm:w-44">
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scanning…
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Run health check
            </>
          )}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        Examples:{" "}
        <button
          type="button"
          className="underline hover:text-foreground"
          onClick={() => setValue("vercel/next.js")}
        >
          vercel/next.js
        </button>
        {" · "}
        <button
          type="button"
          className="underline hover:text-foreground"
          onClick={() => setValue("facebook/react")}
        >
          facebook/react
        </button>
        {" · "}
        <button
          type="button"
          className="underline hover:text-foreground"
          onClick={() => setValue("expressjs/express")}
        >
          expressjs/express
        </button>
      </p>
    </form>
  );
}
