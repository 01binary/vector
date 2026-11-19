# Load chat model
from openai import OpenAI
chat_model = OpenAI(
  base_url="http://127.0.0.1:1234/v1",
  api_key="lm-studio"
)

# Input
question = input("Question or topic: ").strip()

# Retrieve
from pinecone import EmbedQuery, Pinecone

results = Pinecone().index("vector").documents.search(
  namespace="documents",
  top_k=3,
  score_by=[EmbedQuery(field="text", query=question)],
  include_fields=["text", "source"],
)

# Assemble
context = "\n\n".join(
  f"Source: {match.source}\n{match.text}" for match in results.matches
)

# Load system prompt
from pathlib import Path
system_prompt = Path(__file__).with_name("SYSTEM_PROMPT.md").read_text(encoding="utf-8").strip()

# Output
response = chat_model.chat.completions.create(
    model="google/gemma-3-12b",
    messages=[
        {
            "role": "system",
            "content": system_prompt,
        },
        {
            "role": "user",
            "content": (
                f"Question or topic: {question}\n\n"
                f"Document excerpts:\n{context}"
            ),
        },
    ],
)

print(response.choices[0].message.content)
