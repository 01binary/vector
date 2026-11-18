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

The indexing script creates a serverless index named `vector` with integrated embeddings on the `text` field using `text-embedding-3-small`. Both scripts use the `documents` namespace. [Pinecone integrated embedding documentation](https://sdk.pinecone.io/python/how-to/documents/schema-and-upsert.html)

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
