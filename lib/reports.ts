import fs from "fs";
import path from "path";
import matter from "gray-matter";

const REPORTS_DIR = path.join(process.cwd(), "content", "reports");

export interface ReportFrontmatter {
  title: string;
  date: string;
  description: string;
  tags: string[];
}

export interface ReportMeta extends ReportFrontmatter {
  slug: string;
}

export interface Report extends ReportMeta {
  content: string;
}

export function getAllReports(): ReportMeta[] {
  if (!fs.existsSync(REPORTS_DIR)) return [];

  return fs
    .readdirSync(REPORTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((filename) => {
      const slug = filename.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(REPORTS_DIR, filename), "utf8");
      const { data } = matter(raw);
      return { slug, ...(data as ReportFrontmatter) };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getReport(slug: string): Report | null {
  const filePath = path.join(REPORTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return { slug, ...(data as ReportFrontmatter), content };
}
