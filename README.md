# Vector Database Tutorial

Build a local Chroma vector index from the Markdown files in `documents/`.

The script splits each document into overlapping chunks, converts those chunks to embeddings with [all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2), and stores the embeddings with the original text and source paths.

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

To install dependencies:

```sh
python -m pip install -r requirements.txt
```

## Indexing

To index the documents:

```sh
python ./index.py
```

The first run needs internet access to download the embedding model if it is missing from the local cache.

The script prints the number of chunks indexed for each document, followed by `Total indexed chunks:` and the collection count.

Chroma saves the `documents` collection in `./database/`. Rerunning the script updates chunks with the same document path and chunk number.

## Searching

Edit the search criteria in [search.py](./search.py) and run the search:

```sh
python ./search.py > results.md
```

Inspect the search results in [results.md](./results.md)
