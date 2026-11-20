import { readFile } from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default async function DocumentPage({ params }) {
  const { path: parts } = await params;
  const root = path.resolve("documents");
  const file = path.resolve(root, parts.join("/"));

  if (!file.startsWith(root + path.sep) || !file.endsWith(".md")) notFound();

  let markdown;
  try {
    markdown = await readFile(file, "utf8");
  } catch {
    notFound();
  }

  // Drop front matter and MDX components. Leave fenced code unchanged.
  const body = markdown
    .replace(/^---\r?\n[\s\S]*?\r?\n---/, "")
    .replace(/^(?:\s*import .*\r?\n)+/, "")
    .split(/(```[\s\S]*?```)/)
    .map((part) =>
      part.startsWith("```") ? part : part.replace(/<\/?[A-Z][^>\n]*>/g, ""),
    )
    .join("")
    .trim();

  return (
    <article className="document">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
    </article>
  );
}
