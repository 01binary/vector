# Set search text
query = "psychology"

# Open the Pinecone index
from pinecone import Pinecone

index = Pinecone().index("vector")

# Find similar chunks
from pinecone import EmbedQuery

results = index.documents.search(
    namespace="documents",
    top_k=5,
    score_by=[EmbedQuery(field="text", query=query)],
    include_fields=["text", "source"],
)

# Print matching chunks and source paths
for match in results.matches:
    print(f"[{match.source}]({match.source})")
    print("```")
    print(match.text, end="\n\n")
    print("```")
