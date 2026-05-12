"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ReportMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h2: ({ children }) => (
          <h2 className="mt-12 text-2xl font-bold text-dl-fg">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mt-8 text-lg font-bold text-dl-fg">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="mt-4 text-[15px] leading-[1.7] text-dl-fg-muted">
            {children}
          </p>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-dl-green hover:underline"
            target={href?.startsWith("http") ? "_blank" : undefined}
            rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
          >
            {children}
          </a>
        ),
        code: ({ inline, children }: { inline?: boolean; children?: React.ReactNode }) =>
          inline ? (
            <code className="rounded px-1.5 py-0.5 font-mono text-[13px] bg-[#18181B]">
              {children}
            </code>
          ) : (
            <code className="block rounded-md border border-dl-border bg-[#18181B] p-4 font-mono text-[13px] text-dl-fg-muted overflow-x-auto">
              {children}
            </code>
          ),
        pre: ({ children }) => <pre className="mt-4">{children}</pre>,
        table: ({ children }) => (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse border border-dl-border font-mono text-[13px]">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-[#111113]">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="border border-dl-border px-4 py-2 text-left text-dl-fg">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-dl-border px-4 py-2 text-dl-fg-muted">
            {children}
          </td>
        ),
        hr: () => <hr className="my-8 border-dl-border" />,
        ul: ({ children }) => (
          <ul className="mt-4 list-disc pl-6 text-[15px] leading-[1.7] text-dl-fg-muted space-y-1">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="mt-4 list-decimal pl-6 text-[15px] leading-[1.7] text-dl-fg-muted space-y-1">
            {children}
          </ol>
        ),
        blockquote: ({ children }) => (
          <blockquote className="mt-4 border-l-2 border-dl-green pl-4 italic text-dl-fg-muted">
            {children}
          </blockquote>
        ),
        em: ({ children }) => (
          <em className="italic text-dl-fg-muted">{children}</em>
        ),
        strong: ({ children }) => (
          <strong className="font-bold text-dl-fg">{children}</strong>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
