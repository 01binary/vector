import { readFileSync } from "node:fs";
import path from "node:path";
import { SystemMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import {
  Annotation,
  END,
  MessagesAnnotation,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { saveFact, searchFacts } from "./facts";

const systemPrompt = readFileSync(
  path.join(process.cwd(), "SYSTEM_PROMPT.md"),
  "utf8",
).trim();

// Write path: the model decides when to call this tool.
const saveFactTool = tool(
  async ({ fact }) => `Saved: ${await saveFact(fact)}`,
  {
    name: "save_fact",
    description:
      "Save one durable fact the user shared so it can be recalled in later conversations.",
    schema: z.object({
      fact: z
        .string()
        .describe(
          "One self-contained sentence in the third person, such as: The user's dog is named Rex.",
        ),
    }),
  },
);

const tools = [saveFactTool];

const chatModel = new ChatOpenAI({
  model: process.env.OPENAI_MODEL,
  apiKey: process.env.OPENAI_API_KEY,
  configuration: { baseURL: process.env.OPENAI_BASE_URL },
}).bindTools(tools);

const State = Annotation.Root({
  ...MessagesAnnotation.spec,
  facts: Annotation(),
});

// Read path: always search for facts related to the latest message.
async function retrieve({ messages }) {
  const matches = await searchFacts(messages.at(-1).text);
  const facts = matches
    .map((match) => `- ${match.text} (saved ${match.savedAt.slice(0, 10)})`)
    .join("\n");
  return { facts: facts || "(none)" };
}

// Models without a system role, such as Gemma, merge the system prompt into
// the first user turn. The last sentence marks where the conversation begins,
// so the model answers the user instead of acknowledging the instructions.
async function agent({ messages, facts }) {
  const system = new SystemMessage(
    `${systemPrompt}\n\nKnown facts:\n${facts}\n\nThe conversation with the user starts now.`,
  );
  return { messages: [await chatModel.invoke([system, ...messages])] };
}

// Some models, such as Gemma, reply in the same turn as the tool call. Others,
// such as Qwen, call the tool first and reply after seeing its result. Only
// go back to the agent if it has not replied yet.
function afterTools({ messages }) {
  const toolCall = messages.findLast((message) => message.tool_calls?.length);
  return toolCall.text.trim() ? END : "agent";
}

// START -> retrieve -> agent -> (tools -> agent)* -> END
export const graph = new StateGraph(State)
  .addNode("retrieve", retrieve)
  .addNode("agent", agent)
  .addNode("tools", new ToolNode(tools))
  .addEdge(START, "retrieve")
  .addEdge("retrieve", "agent")
  .addConditionalEdges("agent", toolsCondition)
  .addConditionalEdges("tools", afterTools)
  .compile();
