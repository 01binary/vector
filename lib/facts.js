import { createHash } from "node:crypto";
import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone();
let ready;

// Create the index on first use. Pinecone embeds the `text` field itself,
// so the app never handles vectors.
function facts() {
  ready ??= pinecone.indexes
    .create({
      name: "vector",
      schema: {
        fields: {
          text: { type: "string", embed: { model: "text-embedding-3-small" } },
        },
      },
      suppressConflicts: true,
      waitUntilReady: true,
    })
    .catch((error) => {
      ready = undefined;
      throw error;
    });

  return ready.then(() =>
    pinecone.index({ name: "vector", namespace: "facts" }),
  );
}

export async function searchFacts(query, topK = 5) {
  const index = await facts();
  const results = await index.documents.search({
    topK,
    scoreBy: [{ type: "embed", field: "text", query }],
    includeFields: ["text", "savedAt"],
  });
  return results.matches;
}

// The ID is a hash of the normalized text, so saving the same fact twice
// overwrites the first copy instead of adding a duplicate.
export async function saveFact(text) {
  const fact = text.trim();
  const id = createHash("sha256").update(fact.toLowerCase()).digest("hex");
  const index = await facts();
  await index.documents.upsert({
    documents: [{ _id: id, text: fact, savedAt: new Date().toISOString() }],
  });
  return fact;
}
