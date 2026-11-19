# Pinecone Vector Database Tutorial

Build a hosted Pinecone vector index from the Markdown files in `documents/`.

The indexing script splits each document into overlapping chunks and uploads the text and source paths. Pinecone embeds both the chunks and your search query, then returns up to five matching chunks.

## Environment

If you already have `pyenv` set up, skip to the next section.

On macOS with Homebrew, install it with `brew install pyenv` or follow the [official pyenv setup guide](https://github.com/pyenv/pyenv#installation).

```sh
pyenv install -s 3.11
pyenv local 3.11
python -m venv .venv
source .venv/bin/activate
```

## Dependencies

Install the Python dependencies.

```sh
python -m pip install -r requirements.txt
```

## Pinecone setup

Create a project and API key in the [Pinecone console](https://app.pinecone.io/). From the repository root, set the key in your shell.

```sh
export PINECONE_API_KEY="your-api-key"
```

The indexing script creates a serverless index named `vector` with integrated embeddings on the `text` field using [text-embedding-3-small](https://developers.openai.com/api/docs/models/text-embedding-3-small).

The scripts use the `documents` namespace. [Pinecone integrated embedding documentation](https://sdk.pinecone.io/python/how-to/documents/schema-and-upsert.html)

## Indexing

Run the indexing script.

```sh
python ./index.py
```

The script prints the number of chunks Pinecone accepted for each document and the total for that run. Rerunning it updates chunks with the same source path and chunk number. Chunks from removed files or from the end of shortened files stay in the index.

## Searching

Edit `query` in [search.py](./search.py) and run the search.

```sh
python ./search.py > results.md
```

Open [results.md](./results.md) to see the matching text and source links. Pinecone applies writes asynchronously, so results may take a moment to appear after indexing. [Pinecone upsert documentation](https://sdk.pinecone.io/python/how-to/documents/schema-and-upsert.html)

## Asking questions

Index the documents first with `python ./index.py`.

Open LM Studio, download a chat model, and start the local server on port `1234` from the Developer tab. [LM Studio server setup](https://lmstudio.ai/docs/developer/rest/quickstart)

Set `model=` in [rag.py](./rag.py) to the model identifier shown in LM Studio. Then run this from the repository root with `PINECONE_API_KEY` set.

```sh
python ./rag.py
```

At the `Question or topic:` prompt, type a topic like `probability` or ask a question about the documents.
