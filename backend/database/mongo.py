import json
import os
from typing import Dict, List, Any, Optional, Union
import uuid

class InMemoryMongoCollection:
    def __init__(self, name: str, db_file_path: str):
        self.name = name
        self.db_file_path = db_file_path
        self._data: Dict[str, dict] = {}
        self._load()

    def _load(self):
        if os.path.exists(self.db_file_path):
            try:
                with open(self.db_file_path, "r", encoding="utf-8") as f:
                    self._data = json.load(f)
            except Exception:
                self._data = {}
        else:
            self._data = {}

    def _save(self):
        os.makedirs(os.path.dirname(self.db_file_path), exist_ok=True)
        with open(self.db_file_path, "w", encoding="utf-8") as f:
            json.dump(self._data, f, indent=2, default=str)

    def find_one(self, filter_dict: dict) -> Optional[dict]:
        for doc in self._data.values():
            match = True
            for k, v in filter_dict.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                return doc.copy()
        return None

    def find(self, filter_dict: dict = None, sort_key: str = None, reverse: bool = False) -> List[dict]:
        results = []
        filter_dict = filter_dict or {}
        for doc in self._data.values():
            match = True
            for k, v in filter_dict.items():
                if isinstance(v, dict) and "$in" in v:
                    if doc.get(k) not in v["$in"]:
                        match = False
                        break
                elif doc.get(k) != v:
                    match = False
                    break
            if match:
                results.append(doc.copy())
        if sort_key:
            results.sort(key=lambda x: x.get(sort_key, ""), reverse=reverse)
        return results

    def insert_one(self, doc: dict) -> dict:
        if "id" not in doc:
            doc["id"] = str(uuid.uuid4())
        self._data[doc["id"]] = doc.copy()
        self._save()
        return doc

    def update_one(self, filter_dict: dict, update_dict: dict) -> bool:
        doc = self.find_one(filter_dict)
        if doc:
            doc_id = doc["id"]
            if "$set" in update_dict:
                for k, v in update_dict["$set"].items():
                    self._data[doc_id][k] = v
            elif "$push" in update_dict:
                for k, v in update_dict["$push"].items():
                    if k not in self._data[doc_id]:
                        self._data[doc_id][k] = []
                    self._data[doc_id][k].append(v)
            else:
                for k, v in update_dict.items():
                    self._data[doc_id][k] = v
            self._save()
            return True
        return False

    def delete_one(self, filter_dict: dict) -> bool:
        doc = self.find_one(filter_dict)
        if doc:
            del self._data[doc["id"]]
            self._save()
            return True
        return False

    def count_documents(self, filter_dict: dict = None) -> int:
        return len(self.find(filter_dict))


class DatabaseManager:
    def __init__(self, storage_dir: str = None):
        self.storage_dir = storage_dir or os.path.join(os.path.dirname(__file__), "..", "data_store")
        os.makedirs(self.storage_dir, exist_ok=True)
        self.collections: Dict[str, InMemoryMongoCollection] = {}

    def get_collection(self, name: str) -> InMemoryMongoCollection:
        if name not in self.collections:
            file_path = os.path.join(self.storage_dir, f"{name}.json")
            self.collections[name] = InMemoryMongoCollection(name, file_path)
        return self.collections[name]

db = DatabaseManager()
