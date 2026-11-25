import { toBaseMessages, toUIMessageStream } from "@ai-sdk/langchain";
import { createUIMessageStreamResponse } from "ai";
import { graph } from "../../../lib/graph";

export async function POST(req) {
  const { messages } = await req.json();

  const stream = await graph.stream(
    { messages: await toBaseMessages(messages) },
    { streamMode: ["values", "messages"] },
  );

  return createUIMessageStreamResponse({ stream: toUIMessageStream(stream) });
}
