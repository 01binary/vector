# Create index database and collection
import chromadb
db = chromadb.PersistentClient(path="./database")
collection = db.get_or_create_collection("documents")

# Load embedding model
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("all-MiniLM-L6-v2")

# Split documents into overlapping chunks
def chunk_text(text, size=500, overlap=100):
    step = size - overlap
    for start in range(0, len(text), step):
        chunk = text[start:start + size]
        if chunk.strip():
            yield chunk

# Index documents
from pathlib import Path

for path in sorted(Path("documents").rglob("*.md")):
    # Load document
    text = path.read_text(encoding="utf-8")

    # Split into overlapping chunks
    chunks = list(chunk_text(text))

    if not chunks:
        continue

    # Convert chunks to vectors
    vectors = model.encode(chunks).tolist()

    # Store vectors and source text
    collection.upsert(
        ids=[f"{path}:{i}" for i in range(len(chunks))],
        embeddings=vectors,
        documents=chunks,
        metadatas=[{"source": str(path)} for _ in chunks],
    )

    print(f"Indexed {path}: {len(chunks)} chunks")

print(f"Total indexed chunks: {collection.count()}")
