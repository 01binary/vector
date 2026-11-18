# Vector Database Tutorial

Build a local Chroma vector index from the Markdown files in `documents/`. The script splits each document into overlapping chunks, converts those chunks to embeddings with `all-MiniLM-L6-v2`, and stores the embeddings with the original text and source paths.

## Install and configure pyenv

If you already have `pyenv` set up, skip to the next section. On macOS with Homebrew, install it with `brew install pyenv`. Follow the guide for your operating system to configure your shell and install the Python build dependencies. Then open a new terminal and run `pyenv --version` to check that it is available. [Official pyenv setup guide](https://github.com/pyenv/pyenv#installation)

## Create a Python environment

In your terminal, change to the tutorial directory containing `index.py` and `requirements.txt`. Install and select Python 3.11 with `pyenv`, then create and activate a virtual environment for the tutorial's dependencies.

```sh
pyenv install -s 3.11
pyenv local 3.11
python -m venv .venv
source .venv/bin/activate
python --version
python -m pip install -r requirements.txt
```

`python --version` should show Python 3.11.x. `pyenv local` saves the Python version for this directory in `.python-version`. When you return in a new terminal, run `source .venv/bin/activate` from the tutorial directory before running the script again.

## Run the indexer

With the virtual environment active, run this from the tutorial directory.

```sh
python ./index.py
```

The first run needs internet access to download the embedding model if it is missing from the local cache. The script prints the number of chunks indexed for each document, followed by `Total indexed chunks:` and the collection count. Chroma saves the `documents` collection in `./database/`. Rerunning the script updates chunks with the same document path and chunk number.

### If indexing crashes on macOS

If the error mentions `MPSNDArray`, set the embedding model to run on the CPU by changing its initialization in `index.py` to the following line.

```python
model = SentenceTransformer("all-MiniLM-L6-v2", device="cpu")
```

Then rerun `python ./index.py`.
