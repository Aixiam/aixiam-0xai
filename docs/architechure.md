# VersoriumX Architecture Overview

This document describes the high-level architecture of the VersoriumX project, detailing how its various components (Frontend, AI Backend, Smart Contracts, IPFS Tools) interact to deliver the platform's features.

## Key Components:

1.  **Frontend (React dApp):** User interface, Wallet Connect, Vyper Editor, AI Search UI.
2.  **Smart Contracts (Vyper/Hardhat):** On-chain logic, data storage, interactions.
3.  **AI Search Backend (Python/FastAPI):** Off-chain data processing, vector search, semantic understanding.
4.  **IPFS Tools (Node.js/Pinata):** Decentralized storage for static assets and metadata.

## Interaction Flow:

*   **User -> Frontend:** All user interactions begin here.
*   **Frontend <-> Smart Contracts:** Web3 Wallet -> Ethers.js/Wagmi -> Hardhat Node/EVM (direct contract calls, events).
*   **Frontend <-> AI Backend:** HTTP API calls for search queries.
*   **Frontend <-> IPFS:** Retrieve content via IPFS gateways, potentially directly via Pinata API (for client-side retrieval).
*   **Contracts <-> IPFS:** Contracts store CIDs; frontend resolves them.
*   **AI Backend -> Contracts:** Indexing agent reads on-chain data.
*   **AI Backend -> IPFS:** Indexing agent may read IPFS content if applicable.
*   **IPFS Tools -> Pinata:** Uploads content from data/ and build/ directories.

*(Further details on data flow, security, scalability, etc., would go here)*
