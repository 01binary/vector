"use client";

import {
  AssistantRuntimeProvider,
  AuiIf,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/ai-sdk";
import {
  MarkdownTextPrimitive,
  unstable_memoizeMarkdownComponents,
} from "@assistant-ui/react-markdown";
import remarkGfm from "remark-gfm";

const markdownComponents = unstable_memoizeMarkdownComponents({
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  ),
});

function linkCitations(text) {
  return text.replace(
    /\[(documents\/[^\]]+\.md)\](?!\()/g,
    "[$1](/$1)",
  );
}

function MarkdownText() {
  return (
    <MarkdownTextPrimitive
      remarkPlugins={[remarkGfm]}
      preprocess={linkCitations}
      components={markdownComponents}
    />
  );
}

export default function Page() {
  const runtime = useChatRuntime();

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ThreadPrimitive.Root className="thread">
        <ThreadPrimitive.Viewport className="viewport">
          <AuiIf condition={(state) => state.thread.isEmpty}>
            <p className="empty">Ask a question about the documents.</p>
          </AuiIf>

          <ThreadPrimitive.Messages>
            {({ message }) =>
              message.role === "user" ? <UserMessage /> : <AssistantMessage />
            }
          </ThreadPrimitive.Messages>

          <ThreadPrimitive.ViewportFooter className="footer">
            <ComposerPrimitive.Root className="composer">
              <ComposerPrimitive.Input
                placeholder="Ask about the documents"
                rows={1}
              />
              <ComposerPrimitive.Send>Send</ComposerPrimitive.Send>
            </ComposerPrimitive.Root>
          </ThreadPrimitive.ViewportFooter>
        </ThreadPrimitive.Viewport>
      </ThreadPrimitive.Root>
    </AssistantRuntimeProvider>
  );
}

function MessageError() {
  return (
    <MessagePrimitive.Error>
      <ErrorPrimitive.Root className="error">
        <ErrorPrimitive.Message />
      </ErrorPrimitive.Root>
    </MessagePrimitive.Error>
  );
}

function UserMessage() {
  return (
    <MessagePrimitive.Root className="user">
      <div className="user-bubble">
        <MessagePrimitive.Parts />
      </div>
      <MessageError />
    </MessagePrimitive.Root>
  );
}

function AssistantMessage() {
  return (
    <MessagePrimitive.Root className="assistant markdown">
      <MessagePrimitive.Parts components={{ Text: MarkdownText }} />
      <MessageError />
    </MessagePrimitive.Root>
  );
}
