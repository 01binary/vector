# Connect to Chroma database
import chromadb

db = chromadb.PersistentClient(path="./database")
collection = db.get_collection("documents")

# Load embedding model
from sentence_transformers import SentenceTransformer
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# Load chat model
from openai import OpenAI
chat_model = OpenAI(
  base_url="http://127.0.0.1:1234/v1",
  api_key="lm-studio"
)

# Input
question = input("Question or topic: ").strip()

# Embed
vector = embedding_model.encode(question).tolist()

# Retrieve
results = collection.query(
  query_embeddings=[vector],
  n_results=3,
  include=["documents", "metadatas"]
)

# Assemble
context = "\n\n".join(
  f"Source: {metadata['source']}\n{text}"

  for text, metadata in zip(
    results["documents"][0],
    results["metadatas"][0],
  )
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
