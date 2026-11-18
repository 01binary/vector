# Create and open the Pinecone index
from pinecone import Pinecone

pc = Pinecone()

if not pc.indexes.exists("vector"):
    pc.indexes.create(
        name="vector",
        schema={"fields": {"text": {
            "type": "string",
            "embed": {"model": "text-embedding-3-small"},
        }}},
    )

index = pc.index("vector")

# Split documents into overlapping chunks
def chunk_text(text, size=500, overlap=100):
    for start in range(0, len(text), size - overlap):
        chunk = text[start:start + size]
        if chunk.strip():
            yield chunk

# Upload chunks for Pinecone to embed
from hashlib import sha256
from pathlib import Path

total = 0
for path in sorted(Path("documents").rglob("*.md")):
    chunks = list(chunk_text(path.read_text(encoding="utf-8")))
    if not chunks:
        continue

    path_id = sha256(str(path).encode("utf-8")).hexdigest()
    result = index.documents.batch_upsert(
        namespace="documents",
        documents=[
            {"_id": f"{path_id}:{i}", "text": chunk, "source": str(path)}
            for i, chunk in enumerate(chunks)
        ],
        show_progress=False,
    )
    if result.errors:
        raise SystemExit(f"Could not index {path}. {result.errors[0].error_message}")

    print(f"Indexed {path}: {result.successful_item_count} chunks")
    total += result.successful_item_count

print(f"Total indexed chunks: {total}")
