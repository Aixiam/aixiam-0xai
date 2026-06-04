from pydantic import BaseModel
from typing import List, Dict

class SearchQuery(BaseModel):
    query: str

class SearchResult(BaseModel):
    title: str
    snippet: str
    source: str
    url: str | None = None
    cid: str | None = None
    score: float | None = None
