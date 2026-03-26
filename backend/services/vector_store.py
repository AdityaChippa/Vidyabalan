import os
import chromadb
from dotenv import load_dotenv

load_dotenv()

CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")

_client = None

def get_client() -> chromadb.PersistentClient:
    global _client
    if _client is None:
        _client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
    return _client

def get_or_create_collection(textbook_id: str):
    client = get_client()
    collection_name = f"textbook_{textbook_id.replace('-', '_')}"
    if len(collection_name) > 63:
        collection_name = collection_name[:63]
    return client.get_or_create_collection(
        name=collection_name,
        metadata={"hnsw:space": "cosine"}
    )

def add_chunks(textbook_id: str, chunk_ids: list, documents: list, embeddings: list, metadatas: list):
    collection = get_or_create_collection(textbook_id)
    batch_size = 100
    for i in range(0, len(chunk_ids), batch_size):
        end = min(i + batch_size, len(chunk_ids))
        collection.add(
            ids=chunk_ids[i:end],
            documents=documents[i:end],
            embeddings=embeddings[i:end],
            metadatas=metadatas[i:end]
        )

def query_chunks(textbook_id: str, query_embedding: list, n_results: int = 3):
    collection = get_or_create_collection(textbook_id)
    if collection.count() == 0:
        return {"documents": [[]], "metadatas": [[]], "distances": [[]]}
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(n_results, collection.count())
    )
    return results

def get_all_documents(textbook_id: str) -> str:
    collection = get_or_create_collection(textbook_id)
    if collection.count() == 0:
        return ""
    all_docs = collection.get()
    return "\n\n---\n\n".join(all_docs["documents"])

def delete_collection(textbook_id: str):
    client = get_client()
    collection_name = f"textbook_{textbook_id.replace('-', '_')}"
    if len(collection_name) > 63:
        collection_name = collection_name[:63]
    try:
        client.delete_collection(collection_name)
    except Exception:
        pass
