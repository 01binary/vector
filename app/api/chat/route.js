import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText } from "ai";
import { Pinecone } from "@pinecone-database/pinecone";
import { readFile } from "node:fs/promises";
import path from "node:path";

const chatModel = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  const { messages } = await req.json();
  const question = userText(messages.at(-1));

  const results = await new Pinecone()
    .index({ name: "vector", namespace: "documents" })
    .documents.search({
      topK: 3,
      scoreBy: [{ type: "embed", field: "text", query: question }],
      includeFields: ["text", "source"],
    });

  const context = results.matches
    .map((match) => `Source: ${match.source}\n${match.text}`)
    .join("\n\n");

  const systemPrompt = (
    await readFile(path.join(process.cwd(), "SYSTEM_PROMPT.md"), "utf8")
  ).trim();

  const history = await convertToModelMessages(messages.slice(0, -1));
  const result = streamText({
    model: chatModel(process.env.OPENAI_MODEL),
    system: systemPrompt,
    messages: [
      ...history,
      {
        role: "user",
        content: `Question or topic: ${question}\n\nDocument excerpts:\n${context}`,
      },
    ],
  });

  return result.toUIMessageStreamResponse();
}

function userText(message) {
  return (message?.parts ?? [])
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("")
    .trim();
}
