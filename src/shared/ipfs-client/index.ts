import pinataSDK, { PinataPinOptions } from '@pinata/sdk';
import fs from 'fs';
import path from 'path';

export interface VersoriumXIpfsMetadata extends PinataPinOptions {
  name: string;
  keyvalues?: {
    [key: string]: string | number | boolean;
    versoriumx_project: string;
    versoriumx_version: string;
    timestamp: string;
  };
}

export class VersoriumXPinataClient {
  private pinata: pinataSDK;
  private projectBaseMetadata: { versoriumx_project: string, versoriumx_version: string };

  constructor(
    apiKey: string,
    secretKey: string,
    projectBaseMetadata: { project: string, version: string }
  ) {
    if (!apiKey || !secretKey) {
      throw new Error("Pinata API Key and Secret Key are required.");
    }
    this.pinata = new pinataSDK(apiKey, secretKey);
    this.projectBaseMetadata = {
      versoriumx_project: projectBaseMetadata.project,
      versoriumx_version: projectBaseMetadata.version
    };
    console.log(`VersoriumX Pinata Client initialized for project: ${projectBaseMetadata.project}`);
  }

  private getCommonPinOptions(customName: string, additionalKeyvalues?: { [key: string]: string | number | boolean }): PinataPinOptions {
    return {
      pinataMetadata: {
        name: customName,
        keyvalues: {
          ...this.projectBaseMetadata,
          timestamp: new Date().toISOString(),
          ...additionalKeyvalues
        }
      }
    };
  }

  async uploadJson(
    data: object,
    name: string,
    additionalKeyvalues?: { [key: string]: string | number | boolean }
  ): Promise<string> {
    const options = this.getCommonPinOptions(name, additionalKeyvalues);
    try {
      const result = await this.pinata.pinJSONToIPFS(data, options);
      console.log(`JSON '${name}' uploaded to IPFS. CID: ${result.IpfsHash}`);
      return result.IpfsHash;
    } catch (error) {
      console.error(`Error uploading JSON '${name}':`, error);
      throw new Error(`Failed to upload JSON to Pinata: ${error.message || error}`);
    }
  }

  async uploadFile(
    filePath: string,
    name: string,
    additionalKeyvalues?: { [key: string]: string | number | boolean }
  ): Promise<string> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    const readableStreamForFile = fs.createReadStream(filePath);
    const options = this.getCommonPinOptions(name, additionalKeyvalues);

    try {
      const result = await this.pinata.pinFileToIPFS(readableStreamForFile, options);
      console.log(`File '${name}' uploaded to IPFS. CID: ${result.IpfsHash}`);
      return result.IpfsHash;
    } catch (error) {
      console.error(`Error uploading file '${name}':`, error);
      throw new Error(`Failed to upload file to Pinata: ${error.message || error}`);
    }
  }

  async uploadDirectory(
    directoryPath: string,
    name?: string,
    additionalKeyvalues?: { [key: string]: string | number | boolean }
  ): Promise<string> {
    if (!fs.existsSync(directoryPath) || !fs.statSync(directoryPath).isDirectory()) {
      throw new Error(`Directory not found or not a directory at path: ${directoryPath}`);
    }

    const directoryName = name || path.basename(directoryPath);
    const options = this.getCommonPinOptions(directoryName, {
      ...additionalKeyvalues,
      type: 'directory'
    });

    try {
      const result = await this.pinata.pinFromFS(directoryPath, options);
      console.log(`Directory '${directoryName}' uploaded to IPFS. CID: ${result.IpfsHash}`);
      return result.IpfsHash;
    } catch (error) {
      console.error(`Error uploading directory '${directoryName}':`, error);
      throw new Error(`Failed to upload directory to Pinata: ${error.message || error}`);
    }
  }

  async testAuthentication(): Promise<boolean> {
    try {
      const result = await this.pinata.testAuthentication();
      return result.authenticated;
    } catch (error) {
      console.error("Pinata authentication failed:", error);
      return false;
    }
  }
}
