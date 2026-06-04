import { VersoriumXPinataClient } from '../../shared/ipfs-client/src/index'; // Adjust path if shared is outside src/
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { readFileSync } from 'fs';
import { default as mcpConfig } from '../../../config/project.config.json'; // Import mcp.json directly

// Load .env file from the project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

interface UploadedManifestEntry {
  path: string;
  cid: string;
  name: string;
  type: string;
  timestamp: string;
}

async function uploadVersoriumXAssets() {
  const pinataApiKey = process.env.PINATA_API_KEY;
  const pinataSecretKey = process.env.PINATA_SECRET_API_KEY;

  if (!pinataApiKey || !pinataSecretKey) {
    console.error("PINATA_API_KEY and PINATA_SECRET_API_KEY must be set in .env");
    process.exit(1);
  }

  const projectName = mcpConfig.projectName;
  const projectVersion = mcpConfig.version;
  const uploadTargets = mcpConfig.components.ipfsTools.uploadTargets;
  const uploadManifestPath = path.resolve(process.cwd(), mcpConfig.components.ipfsTools.uploadManifestPath);

  const client = new VersoriumXPinataClient(pinataApiKey, pinataSecretKey, { project: projectName, version: projectVersion });

  // Test authentication
  const auth = await client.testAuthentication();
  if (!auth) {
    console.error("Pinata authentication failed. Check your API keys.");
    process.exit(1);
  }

  console.log('Starting IPFS upload process...');
  const uploadManifest: UploadedManifestEntry[] = existsSync(uploadManifestPath)
    ? JSON.parse(readFileSync(uploadManifestPath, 'utf-8'))
    : [];

  const newUploadManifest: UploadedManifestEntry[] = [];

  for (const target of uploadTargets) {
    const absolutePath = path.resolve(process.cwd(), target.path);
    const contentName = target.name;
    const isDirectory = fs.existsSync(absolutePath) && fs.statSync(absolutePath).isDirectory();

    // Check if content hash has changed, if not, skip
    // (A more robust solution would calculate a hash of the content/directory and compare)
    const existingEntry = uploadManifest.find(e => e.path === target.path && e.name === target.name);
    // For simplicity, this example just re-uploads. For efficiency, implement hash comparison here.
    // E.g., const currentHash = calculateContentHash(absolutePath, isDirectory);
    // if (existingEntry && existingEntry.contentHash === currentHash) {
    //   console.log(`Skipping ${contentName}: Content unchanged.`);
    //   newUploadManifest.push(existingEntry);
    //   continue;
    // }

    let cid: string | null = null;
    try {
      if (isDirectory) {
        cid = await client.uploadDirectory(absolutePath, contentName, { type: contentName.replace(/ /g, '_').toLowerCase() });
      } else if (fs.existsSync(absolutePath)) {
        // Handle single file like metadata.json
        if (absolutePath.endsWith('.json')) {
          const jsonContent = JSON.parse(readFileSync(absolutePath, 'utf-8'));
          cid = await client.uploadJson(jsonContent, contentName, { type: contentName.replace(/ /g, '_').toLowerCase() });
        } else {
          cid = await client.uploadFile(absolutePath, contentName, { type: contentName.replace(/ /g, '_').toLowerCase() });
        }
      } else {
        console.warn(`Path not found for target '${contentName}': ${absolutePath}`);
        continue;
      }

      if (cid) {
        console.log(`Uploaded '${contentName}'. CID: ${cid}`);
        newUploadManifest.push({
          path: target.path,
          cid: cid,
          name: contentName,
          type: contentName.replace(/ /g, '_').toLowerCase(),
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error(`Error uploading '${contentName}':`, error);
    }
  }

  // Save updated manifest
  writeFileSync(uploadManifestPath, JSON.stringify(newUploadManifest, null, 2));
  console.log(`IPFS upload manifest updated at ${uploadManifestPath}`);
  console.log('IPFS upload process completed.');
}

// Simple command line argument parsing for specific upload targets
const args = process.argv.slice(2);
const specificTarget = args[0]; // e.g., 'frontend-build'

if (specificTarget) {
  // Find the target in mcpConfig and upload only that one.
  // This would require modifying the loop above or abstracting it.
  // For now, this script always runs for all targets.
  console.warn(`Specific target '${specificTarget}' is not yet implemented for direct execution. Uploading all targets.`);
}

uploadVersoriumXAssets();
