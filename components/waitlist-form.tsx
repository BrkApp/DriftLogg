"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { joinWaitlist } from "@/app/actions/waitlist";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const result = await joinWaitlist(email);
      setStatus(result);
      if (result.success) setEmail("");
    } finally {
      setPending(false);
    }
  }

  if (status?.success) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-[#00FF88]/40 bg-[#00FF88]/5 px-4 py-3 font-mono text-sm text-[#00FF88]">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        {status.message}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full space-y-2">
      <div className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-zinc-950/80 p-2 transition-colors focus-within:border-[#00FF88]/60 sm:flex-row sm:items-center">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          required
          className="w-full bg-transparent px-3 py-2.5 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending || !email}
          className="group inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-[#00FF88] px-5 text-sm font-semibold text-black transition-all hover:bg-[#00FF88]/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Get early access
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>
      {status && !status.success && (
        <p className="font-mono text-xs text-[#FF4444]">{status.message}</p>
      )}
    </form>
  );
}
