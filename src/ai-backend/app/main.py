from fastapi import FastAPI, Request, HTTPException, Depends, status
from fastapi.security import APIKeyHeader
from typing import List, Dict
import os
import uvicorn
import logging

from .search_service import AISearchService
from .data_indexer import DataIndexer
from .models import SearchQuery, SearchResult

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="VersoriumX AI Backend")

API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=True)
API_KEY = os.getenv("AI_BACKEND_API_KEY", "testkey")

async def verify_api_key(api_key: str = Depends(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API Key")
    return api_key

search_service = AISearchService()
data_indexer = DataIndexer()

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/search", response_model=List[SearchResult], dependencies=[Depends(verify_api_key)])
async def search_data(query_data: SearchQuery):
    return await search_service.perform_search(query_data.query)

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001)
