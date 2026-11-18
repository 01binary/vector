# Set search text
query = "psychology"

# Open index database and collection
import chromadb
db = chromadb.PersistentClient(path="./database")
collection = db.get_or_create_collection("documents")

if not collection.count():
    raise SystemExit("Run python ./index.py to index the documents first.")

# Load embedding model
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("all-MiniLM-L6-v2")

# Find similar chunks
results = collection.query(
    query_embeddings=[model.encode(query).tolist()],
    n_results=5,
    include=["documents", "metadatas"],
)

# Print matching chunks and source paths
for chunk, metadata in zip(results["documents"][0], results["metadatas"][0]):
    print(f"[{metadata['source']}]({metadata['source']})")
    print("```")
    print(chunk, end="\n\n")
    print("```")
