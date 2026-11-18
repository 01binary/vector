---
title: Retrieval Augmented Generation and Vector Databases
description: Introduction to Retrieval Augmented Generation
image: ./images/ai-integration.png
author: Valeriy Novytskyy
date: 2026-11-18
location: ^H Hackerspace
tags:
  [
    'engineering-software'
  ]
---

## overview

This tutorial will walk you through creating a search index for a collection of documents by using the [Pinecone](https://www.pinecone.io/) serverless [vector database](https://www.pinecone.io/learn/vector-database/) and then using [Retrieval Augmented Generation](https://www.ibm.com/think/topics/retrieval-augmented-generation) (RAG) to build a chatbot that uses this database to answer questions.

While vector databases are useful on their own for indexing a collection of documents, combining this machine learning technique with generative AI provides agents with *long-term memory*, expanding their capabilities.

This hands-on tutorial is designed to help you integrate Retrieval Augmented Generation into your application as quickly as possible.

For a deeper introduction checkout [Vector Databases for Generative AI](https://www.amazon.com/Vector-Databases-Generative-AI-Build-ebook/dp/B0FH35DYNJ) by Leandro Calado.

## why vector database?

Anyone implementing full-text search has to think about:

+ **Tokenizing**, or breaking the search criteria into separate search terms, which is typically done by splitting the text a user typed into a search box by white-space and punctuation characters.
+ **Sub-string matching**, so that a query term like "real" matches "realize".
+ **Stemming**, or transforming words into their most basic versions so that a query like "running" also matches documents containing "runs" or "run".
+ **Stop words**, or common words like "the", "and", "for" that must be filtered from the query to avoid matching every document.
+ **Similarity**, or matching by meaning rather than exact words ("run" - "sprint"), which is usually done by loading a thesaurus for the target language.
+ **Ranking**, or evaluating each maching document against the entire search criteria, usually based on how many of the terms match and their frequency in the document.

A home-made search engine that uses tokenizing and sub-string matching is often sufficient for a personal blog or a hobby app.

Deployment at scale requires the intuitiveness of stemming, similarity matching, ranking, and highlighting matched terms in passages to support the varied needs of many users.

Only enterprise search engines like [Elasticsearch](https://www.elastic.co/) supported the [BM25](https://www.elastic.co/search-labs/blog/lexical-and-semantic-search-with-elasticsearch) similarity algorithm for stemming and similarity matching until recently, requiring costly solutions like always-running virtual machines.

Open-source vector databases like [Qdrant](https://github.com/qdrant/qdrant) and [Chroma](https://github.com/chroma-core/chroma) build on [Embedding](https://www.ibm.com/think/topics/vector-embedding) layers used to convert text and images into numbers that neural networks can process, re-using the same mechanism for similarity search, and adding common database operations like inserts and queries.

This technology spawned many affordable serverless solutions with free tiers and pricing based on usage, bringing advanced full-text search within the grasp of hobbyists and lean startups.

## selecting a database

A survey of popular vector databases reveals the following:

|Solution|Deployment|Storage|Usage Limits|
|-|-|-|-|
|[Chroma](https://www.trychroma.com/)|`Local` `Serverless`|`1 GB`|**Low Cost**: `1T` transfer `$5` / month
|[Pinecone](https://www.pinecone.io/)|`Serverless`|`2 GB`|**Free**: `1M` read + `2M` writes / month|
|[Qdrant](https://qdrant.tech/cloud/)|`Local` `VM`|`4 GB`|**Free**: `0.5` vCPU, unlimited requests|
|[Upstash](https://upstash.com/)|`Serverless`|`2 GB`|**Free**: `10K` queries + `10K` updates / day|

**Qdrant** and **Chroma** databases are open-source and can be operated locally or in the cloud while **Pinecone** and **Upstash** only run in the cloud and therefore require an API key.

**Pinecone** is a better choice for unattended deployments, such as a personal blog or an app. Unlike Qdrant which [shuts down inactive virtual machine clusters](https://qdrant.tech/documentation/cloud/create-cluster), Pinecone is *serverless* and spins up virtual machines on request.

## indexing

Indexing with a vector database involves:

+ *Chunking* and *vectorizing* a collection of documents
+ Creating a database and inserting the vectors

The next few sections examine these terms in detail and provide code samples using [chromadb](https://pypi.org/project/chromadb/) package for Python.

## chunking

Vectorizing a document requires feeding it through a neural network implemented by using the Transformer architecture - essentially a Large Lanugage Model (LLM).

LLMs have limited context size and cannot process arbitrarily large documents. The documents are therefore split into bite-sized chunks.

Chunking also aids retrieval, allowing us to return the *matching passage* instead of the entire document, which is a lot friendlier for the users.

The simplest chunking method is splitting each document into equal size chunks with overlap. The overlap helps when the split happens mid-sentence:

```python
# Split document into chunks
def chunk_text(text, size=500, overlap=100):
    step = size - overlap

    for start in range(0, len(text), step):
        chunk = text[start:start + size]

        if chunk.strip():
            yield chunk

## Chunk all markdown documents
for path in sorted(Path("documents").rglob("*.md")):
    text = path.read_text(encoding="utf-8")

    chunks = list(chunk_text(text))

    if not chunks:
        continue

    # 5. Convert chunks to vectors
    vectors = model.encode(chunks).tolist()
```

> **Honorable mention**: [Chroma](https://www.trychroma.com/pricing) does not have a free tier on the cloud, but can be run locally for free just like Qdrant.