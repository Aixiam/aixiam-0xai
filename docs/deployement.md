# VersoriumX Deployment Guide

This document outlines the steps for deploying the VersoriumX project to various environments (local, staging, production).

## 1. Environment Configuration

Refer to `config/project.config.json` for environment-specific URLs, network settings, and component configurations. Ensure your `.env` file is properly configured for the target environment.

## 2. Component-Specific Deployment Steps

### 2.1. Smart Contracts

1.  **Compile:** `pnpm --filter contracts compile`
2.  **Deploy:** `pnpm --filter contracts deploy:<network_name>` (e.g., `deploy:sepolia`)
3.  **Verify:** After deployment, use `pnpm --filter contracts verify <contract_address> --network <network_name>`
    *(Ensure contract addresses are updated in `config/project.config.json` or a generated `deployed-addresses-<network>.json` file)*

### 2.2. IPFS Assets (Frontend & Data)

1.  **Build Frontend:** `pnpm --filter frontend build`
2.  **Upload to Pinata:**
    *   `pnpm --filter ipfs-tools upload-frontend-build` (uploads `build/frontend`)
    *   `pnpm --filter ipfs-tools upload-data-assets` (uploads `data/assets` and `data/metadata.json`)
    *(Update `config/project.config.json` with new IPFS CIDs for the frontend build)*

### 2.3. AI Search Backend

1.  **Build Docker Image:** `docker build -t versoriumx-ai-backend:<tag> src/ai-backend`
2.  **Deploy Container:** Push image to a registry (e.g., GHCR) and deploy to your cloud provider (e.g., Kubernetes, AWS ECS, GCP Cloud Run).
    *(Ensure `AI_BACKEND_API_KEY` and relevant environment variables are set in the deployed container.)*

### 2.4. Frontend (dApp)

1.  **Ensure all other components are deployed/configured.**
2.  The frontend build process needs the correct AI backend URL and contract addresses (these are injected from `config/project.config.json` and `.env` during the build).
3.  The frontend itself is typically served from IPFS (see 2.2). Point your ENS resolver or IPFS gateway to the latest frontend build CID.

## 3. CI/CD Integration

*(Details on GitHub Actions workflows for automated build, test, and deployment would go here.)*
